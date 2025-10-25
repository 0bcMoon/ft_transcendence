import db from "../../db/db";
import gameRepository from './gameRepository';

interface Tournament {
    id: number;
    name: string;
    status: 'registration' | 'active' | 'finished' | 'cancelled';
    winner_id: number | null;
    max_players: number;
    current_round: number;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

interface TournamentPlayer {
    id: number;
    tournament_id: number;
    user_id: number;
    alias: string;
    status: 'active' | 'eliminated' | 'winner';
    registered_at: string;
}

interface TournamentGame {
    id: number;
    tournament_id: number;
    game_id: number;
    round: number;
    match_order: number;
    created_at: string;
}

const tournamentRepository = {
    /**
     * Create a new tournament
     */
    async createTournament(name: string, maxPlayers = 8): Promise<number> {
        if (!name.trim()) throw new Error("Tournament name required");

        const validSizes = [2, 4, 8, 16];
        if (!validSizes.includes(maxPlayers)) {
            throw new Error("Max players must be 2, 4, 8, or 16");
        }

        const result = await db.run(
            `INSERT INTO tournaments (name, max_players, status, current_round) 
             VALUES (?, ?, 'registration', 0)`,
            [name, maxPlayers]
        );

        console.log(`✅ Tournament created: ${name} (ID: ${result.lastID}) - Max: ${maxPlayers} players`);
        return result.lastID;
    },

    /**
     * Get tournament by ID
     */
    async getTournament(id: number): Promise<Tournament | undefined> {
        return db.get<Tournament>(`SELECT * FROM tournaments WHERE id = ?`, [id]);
    },

    /**
     * List all tournaments
     */
    async listTournaments(): Promise<Tournament[]> {
        return db.all<Tournament>(`SELECT * FROM tournaments ORDER BY created_at DESC`);
    },

    /**
     * Get all players in a tournament
     */
    async listPlayers(tournament_id: number): Promise<TournamentPlayer[]> {
        return db.all<TournamentPlayer>(
            `SELECT * FROM tournament_players 
             WHERE tournament_id = ? 
             ORDER BY registered_at ASC`,
            [tournament_id]
        );
    },

    /**
     * Register a player for a tournament
     */
    async registerPlayer(tournament_id: number, user_id: number, alias: string): Promise<number> {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status !== 'registration') throw new Error("Registration closed");

        const { cnt: count } = await db.get<{ cnt: number }>(
            `SELECT COUNT(*) as cnt FROM tournament_players WHERE tournament_id = ?`,
            [tournament_id]
        ) || { cnt: 0 };

        if (count >= tournament.max_players) throw new Error("Tournament full");

        const existing = await db.get<{ id: number }>(
            `SELECT id FROM tournament_players 
             WHERE tournament_id = ? AND (user_id = ? OR alias = ?)`,
            [tournament_id, user_id, alias]
        );
        if (existing) throw new Error("User or alias already registered");

        await db.run('BEGIN TRANSACTION');
        try {
            const result = await db.run(
                `INSERT INTO tournament_players (tournament_id, user_id, alias) VALUES (?, ?, ?)`,
                [tournament_id, user_id, alias]
            );

            const newCount = count + 1;
            console.log(`✅ Player registered: ${alias} (${newCount}/${tournament.max_players})`);

            // Auto-start when full
            if (newCount === tournament.max_players) {
                await this.startTournamentInternal(tournament_id);
            }

            await db.run('COMMIT');
            return result.lastID;
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },

    /**
     * Start tournament (internal - no transaction)
     */
    async startTournamentInternal(tournament_id: number): Promise<void> {
        const players = await this.listPlayers(tournament_id);

        console.log(`🚀 Starting tournament ${tournament_id} with ${players.length} players...`);

        // Update status
        await db.run(
            `UPDATE tournaments 
             SET status = 'active', started_at = CURRENT_TIMESTAMP, current_round = 1 
             WHERE id = ?`,
            [tournament_id]
        );

        // Create Round 1 games
        let matchOrder = 1;
        for (let i = 0; i < players.length; i += 2) {
            const p1 = players[i];
            const p2 = players[i + 1];

            console.log(`  Match ${matchOrder}: ${p1.alias} vs ${p2.alias}`);

            const gameId = await gameRepository.createGame('tournament');
            await gameRepository.addPlayerToGame(gameId, p1.user_id, 1);
            await gameRepository.addPlayerToGame(gameId, p2.user_id, 2);

            await db.run(
                `INSERT INTO tournament_games (tournament_id, game_id, round, match_order)
                 VALUES (?, ?, 1, ?)`,
                [tournament_id, gameId, matchOrder++]
            );
        }

        console.log(`✅ Tournament ${tournament_id} started - Round 1 created`);
    },

    /**
     * Start tournament manually
     */
    async startTournament(tournament_id: number): Promise<void> {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status !== 'registration') throw new Error("Tournament already started");

        const players = await this.listPlayers(tournament_id);
        if (players.length < 2) throw new Error("Need at least 2 players");

        const validSizes = [2, 4, 8, 16];
        if (!validSizes.includes(players.length)) {
            throw new Error(`Need 2, 4, 8, or 16 players. Current: ${players.length}`);
        }

        await db.run('BEGIN TRANSACTION');
        try {
            await this.startTournamentInternal(tournament_id);
            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },

    /**
     * Check and auto-advance tournament after a game finishes
     */

    async checkAndAdvanceRound(game_id: number): Promise<void> {
        console.log(`🔍 Checking tournament for game ${game_id}...`);

        try {
            // Get tournament info for this game
            const tournamentGame = await db.get<{ tournament_id: number; round: number }>(
                `SELECT tournament_id, round FROM tournament_games WHERE game_id = ?`,
                [game_id]
            );

            if (!tournamentGame) {
                console.log(`ℹ️  Game ${game_id} is not a tournament game`);
                return;
            }

            const { tournament_id, round } = tournamentGame;
            console.log(`📋 Game ${game_id} belongs to tournament ${tournament_id}, round ${round}`);

            // Check if all games in this round are finished
            const roundGames = await db.all<{ status: string; game_id: number }>(
                `SELECT g.id as game_id, g.status 
             FROM tournament_games tg
             JOIN games g ON tg.game_id = g.id
             WHERE tg.tournament_id = ? AND tg.round = ?`,
                [tournament_id, round]
            );

            console.log(`📊 Round ${round} status:`, {
                total: roundGames.length,
                finished: roundGames.filter(g => g.status === 'finished').length,
                games: roundGames.map(g => ({ id: g.game_id, status: g.status }))
            });

            const allFinished = roundGames.every(g => g.status === 'finished');

            if (allFinished) {
                console.log(`✅ All Round ${round} games finished! Advancing tournament ${tournament_id}...`);
                await this.advanceRound(tournament_id);
            } else {
                const remaining = roundGames.filter(g => g.status !== 'finished');
                console.log(`⏳ Waiting for ${remaining.length} game(s) to finish:`, remaining.map(g => g.game_id));
            }
        } catch (error) {
            console.error(`❌ Error checking tournament advancement for game ${game_id}:`, error);
            throw error;
        }
    },
    /**
     * Advance to next round
     */
    async advanceRound(tournament_id: number): Promise<void> {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status !== 'active') throw new Error("Tournament not active");

        // Get current round
        const { max_round: currentRound } = await db.get<{ max_round: number }>(
            `SELECT MAX(round) as max_round FROM tournament_games WHERE tournament_id = ?`,
            [tournament_id]
        ) || { max_round: 1 };

        console.log(`⏭️  Advancing tournament ${tournament_id} from round ${currentRound}...`);

        // Get round games with winners
        const roundGames = await db.all<{ game_id: number; winner_id: number | null; status: string }>(
            `SELECT g.id as game_id, g.winner_id, g.status
             FROM tournament_games tg
             JOIN games g ON tg.game_id = g.id
             WHERE tg.tournament_id = ? AND tg.round = ?
             ORDER BY tg.match_order ASC`,
            [tournament_id, currentRound]
        );

        if (roundGames.length === 0) throw new Error("No games in current round");

        // Validate all finished
        const unfinished = roundGames.filter(g => g.status !== 'finished');
        if (unfinished.length > 0) {
            throw new Error(`${unfinished.length} game(s) not finished yet`);
        }

        // Get winners
        const winners = roundGames
            .map(g => g.winner_id)
            .filter((id): id is number => id !== null);

        if (winners.length !== roundGames.length) {
            throw new Error("Some games have no winner");
        }

        console.log(`  Winners:`, winners);

        await db.run('BEGIN TRANSACTION');
        try {
            const players = await this.listPlayers(tournament_id);

            // Eliminate losers
            for (const player of players) {
                if (!winners.includes(player.user_id) && player.status === 'active') {
                    await db.run(
                        `UPDATE tournament_players SET status = 'eliminated' 
                         WHERE tournament_id = ? AND user_id = ?`,
                        [tournament_id, player.user_id]
                    );
                    console.log(`  ❌ Eliminated: ${player.alias}`);
                }
            }

            // Tournament complete - only 1 winner
            if (winners.length === 1) {
                const winner = players.find(p => p.user_id === winners[0]);
                console.log(`🏆 CHAMPION: ${winner?.alias}`);

                await db.run(
                    `UPDATE tournaments 
                     SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`,
                    [winners[0], tournament_id]
                );

                await db.run(
                    `UPDATE tournament_players SET status = 'winner' 
                     WHERE tournament_id = ? AND user_id = ?`,
                    [tournament_id, winners[0]]
                );

                await db.run('COMMIT');
                return;
            }

            // Create next round
            const nextRound = currentRound + 1;
            let matchOrder = 1;

            console.log(`  Creating Round ${nextRound} (${winners.length / 2} matches)...`);

            for (let i = 0; i < winners.length; i += 2) {
                const p1 = players.find(p => p.user_id === winners[i]);
                const p2 = players.find(p => p.user_id === winners[i + 1]);

                console.log(`    Match ${matchOrder}: ${p1?.alias} vs ${p2?.alias}`);

                const gameId = await gameRepository.createGame('tournament');
                await gameRepository.addPlayerToGame(gameId, winners[i], 1);
                await gameRepository.addPlayerToGame(gameId, winners[i + 1], 2);

                await db.run(
                    `INSERT INTO tournament_games (tournament_id, game_id, round, match_order)
                     VALUES (?, ?, ?, ?)`,
                    [tournament_id, gameId, nextRound, matchOrder++]
                );
            }

            await db.run(
                `UPDATE tournaments SET current_round = ? WHERE id = ?`,
                [nextRound, tournament_id]
            );

            await db.run('COMMIT');
            console.log(`✅ Advanced to Round ${nextRound}`);
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },

    /**
     * Get all games for a tournament
     */
    async getTournamentGames(tournament_id: number): Promise<TournamentGame[]> {
        return db.all<TournamentGame>(
            `SELECT * FROM tournament_games 
             WHERE tournament_id = ? 
             ORDER BY round ASC, match_order ASC`,
            [tournament_id]
        );
    },

    /**
     * Get games for a specific round
     */
    async getRoundGames(tournament_id: number, round: number): Promise<TournamentGame[]> {
        return db.all<TournamentGame>(
            `SELECT * FROM tournament_games 
             WHERE tournament_id = ? AND round = ? 
             ORDER BY match_order ASC`,
            [tournament_id, round]
        );
    },

    /**
     * Cancel a tournament
     */
    async cancelTournament(tournament_id: number): Promise<void> {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status === 'finished') throw new Error("Cannot cancel finished tournament");

        await db.run(
            `UPDATE tournaments 
             SET status = 'cancelled', ended_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [tournament_id]
        );

        console.log(`❌ Tournament ${tournament_id} cancelled`);
    },

    /**
     * Get tournament bracket
     */
    async getBracket(tournament_id: number) {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament) throw new Error("Tournament not found");

        const games = await db.all<any>(
            `SELECT 
                tg.round,
                tg.match_order,
                g.id as game_id,
                g.status,
                g.winner_id,
                gp1.user_id as player1_id,
                u1.username as player1_name,
                COALESCE(gp1.score, 0) as player1_score,
                gp2.user_id as player2_id,
                u2.username as player2_name,
                COALESCE(gp2.score, 0) as player2_score
             FROM tournament_games tg
             JOIN games g ON tg.game_id = g.id
             LEFT JOIN game_players gp1 ON g.id = gp1.game_id AND gp1.position = 1
             LEFT JOIN users u1 ON gp1.user_id = u1.id
             LEFT JOIN game_players gp2 ON g.id = gp2.game_id AND gp2.position = 2
             LEFT JOIN users u2 ON gp2.user_id = u2.id
             WHERE tg.tournament_id = ?
             ORDER BY tg.round ASC, tg.match_order ASC`,
            [tournament_id]
        );

        const players = await this.listPlayers(tournament_id);

        return { tournament, players, games };
    },
};

export default tournamentRepository;
