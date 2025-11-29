import db from "../../db/db";
import gameRepository from './gameRepository';
import { Tournament, TournamentPlayer, TournamentGame } from '../types/gameTypes';

async function getPlayerCount(tournament_id: number): Promise<number> {
    const row = await db.get<{ cnt: number }>(
        `SELECT COUNT(*) as cnt FROM tournament_players WHERE tournament_id = ?`,
        [tournament_id]
    );
    return row?.cnt ?? 0;
}

async function startTournamentInternal(tournament_id: number, players: TournamentPlayer[]): Promise<void> {
    await db.run(
        `UPDATE tournaments 
         SET status = 'active', started_at = CURRENT_TIMESTAMP, current_round = 1 
         WHERE id = ?`,
        [tournament_id]
    );

    // 2. Create Round 1 games
    let matchOrder = 1;
    for (let i = 0; i < players.length; i += 2) {
        const p1 = players[i];
        const p2 = players[i + 1];

        // 3. Use the safe, transactional function from gameRepository
        const gameId = await gameRepository.createGameAndAddPlayers('tournament', [
            { user_id: p1.user_id, position: 1 },
            { user_id: p2.user_id, position: 2 }
        ]);

        // 4. Link the new game to the tournament
        await db.run(
            `INSERT INTO tournament_games (tournament_id, game_id, round, match_order)
             VALUES (?, ?, 1, ?)`,
            [tournament_id, gameId, matchOrder++]
        );
    }
}

const tournamentRepository = {

    async createTournament(name: string, maxPlayers = 8): Promise<number> {
        const validSizes = [2, 4, 8, 16];
        if (!validSizes.includes(maxPlayers)) {
            throw new Error("Max players must be 2, 4, 8, or 16");
        }

        const result = await db.run(
            `INSERT INTO tournaments (name, max_players, status, current_round) 
             VALUES (?, ?, 'registration', 0)`,
            [name, maxPlayers]
        );
        return result.lastID;
    },

    async getTournament(id: number): Promise<Tournament | undefined> {
        return db.get<Tournament>(`SELECT * FROM tournaments WHERE id = ?`, [id]);
    },

    // async listTournaments(): Promise<(Tournament & { players_joined: number })[]> {
    //     return db.all<Tournament & { players_joined: number }>(
    //         `SELECT t.*, COUNT(tp.id) as players_joined
    //         FROM tournaments t
    //         LEFT JOIN tournament_players tp ON t.id = tp.tournament_id
    //         GROUP BY t.id
    //         ORDER BY t.created_at DESC`
    //     );
    // },
    async listTournaments(): Promise<Tournament[]> {
        return db.all<Tournament>(
            `SELECT * FROM tournaments ORDER BY created_at DESC`
        );
    },

    async listPlayers(tournament_id: number): Promise<TournamentPlayer[]> {
        return db.all<TournamentPlayer>(
            `SELECT * FROM tournament_players 
             WHERE tournament_id = ? ORDER BY registered_at ASC`,
            [tournament_id]
        );
    },

    async registerPlayer(tournament_id: number, user_id: number, alias: string): Promise<number> {

        await db.run('BEGIN TRANSACTION');

        try {
            const tournament = await db.get<Tournament>(`SELECT * FROM tournaments WHERE id = ?`, [tournament_id]);
            if (!tournament)
                throw new Error("Tournament not found");
            if (tournament.status !== 'registration')
                throw new Error("Registration is closed");

            const count = await getPlayerCount(tournament_id);
            if (count >= tournament.max_players)
                throw new Error("This tournament is full");

            const existing = await db.get<TournamentPlayer>(
                `SELECT id FROM tournament_players 
                 WHERE tournament_id = ? AND (user_id = ? OR alias = ?)`,
                [tournament_id, user_id, alias]
            );
            if (existing) throw new Error("User or alias is already registered");

            const result = await db.run(
                `INSERT INTO tournament_players (tournament_id, user_id, alias) VALUES (?, ?, ?)`,
                [tournament_id, user_id, alias]
            );
            const registrationId = result.lastID;
            const newCount = count + 1;
            if (newCount === tournament.max_players) {
                const players = await this.listPlayers(tournament_id);
                await startTournamentInternal(tournament_id, players);
            }
            await db.run('COMMIT');
            return registrationId;

        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },

    async startTournament(tournament_id: number): Promise<void> {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament)
            throw new Error("Tournament not found");
        if (tournament.status !== 'registration')
            throw new Error("Tournament has already started");

        const players = await this.listPlayers(tournament_id);
        if (![2, 4, 8, 16].includes(players.length)) {
            throw new Error(`Tournaments require 2, 4, 8, or 16 players. Current: ${players.length}`);
        }

        await db.run('BEGIN TRANSACTION');
        try {
            await db.run(
                `UPDATE tournaments 
                 SET status = 'active', started_at = CURRENT_TIMESTAMP, current_round = 1 WHERE id = ?`,
                [tournament_id]
            );

            let matchOrder = 1;
            for (let i = 0; i < players.length; i += 2) {
                const p1 = players[i];
                const p2 = players[i + 1];

                const gameId = await gameRepository.createGameAndAddPlayers('tournament', [
                    { user_id: p1.user_id, position: 1 },
                    { user_id: p2.user_id, position: 2 }
                ]);

                await db.run(
                    `INSERT INTO tournament_games (tournament_id, game_id, round, match_order)
                     VALUES (?, ?, 1, ?)`,
                    [tournament_id, gameId, matchOrder++]
                );
            }

            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },

    async checkAndAdvanceRound(game_id: number): Promise<void> {
        try {
            const tournamentGame = await db.get<{ tournament_id: number; round: number }>(
                `SELECT tournament_id, round FROM tournament_games WHERE game_id = ?`,
                [game_id]
            );

            if (!tournamentGame)
                return;

            const { tournament_id, round } = tournamentGame;

            const roundGames = await db.all<{ status: string }>(
                `SELECT g.status FROM tournament_games tg
                 JOIN games g ON tg.game_id = g.id
                 WHERE tg.tournament_id = ? AND tg.round = ?`,
                [tournament_id, round]
            );

            const allFinished = roundGames.every(g => g.status === 'finished');

            if (allFinished) {
                await this.advanceRound(tournament_id);
            }
        } catch (error) {
            console.error(`Error checking tournament advancement for game ${game_id}:`, error);
            throw error;
        }
    },

    async advanceRound(tournament_id: number): Promise<void> {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament || tournament.status !== 'active')
            return;

        const currentRound = tournament.current_round;

        // Get winners from the current round
        const roundGames = await db.all<{ winner_id: number | null }>(
            `SELECT g.winner_id
             FROM tournament_games tg
             JOIN games g ON tg.game_id = g.id
             WHERE tg.tournament_id = ? AND tg.round = ? AND g.status = 'finished'
             ORDER BY tg.match_order ASC`,
            [tournament_id, currentRound]
        );

        const winners = roundGames.map(g => g.winner_id).filter((id): id is number => id !== null);
        if (winners.length !== roundGames.length) throw new Error("Some games in the round are not finished or have no winner");

        await db.run('BEGIN TRANSACTION');
        try {
            // Eliminate losers
            const players = await this.listPlayers(tournament_id);
            for (const player of players) {
                if (!winners.includes(player.user_id) && player.status === 'active') {
                    await db.run(
                        `UPDATE tournament_players SET status = 'eliminated' WHERE id = ?`,
                        [player.id]
                    );
                }
            }

            // If only one winner, tournament is over
            if (winners.length === 1) {
                await db.run(
                    `UPDATE tournaments 
                     SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`,
                    [winners[0], tournament_id]
                );
                await db.run(
                    `UPDATE tournament_players SET status = 'winner' WHERE tournament_id = ? AND user_id = ?`,
                    [tournament_id, winners[0]]
                );
                await db.run('COMMIT');
                return;
            }

            // Create next round
            const nextRound = currentRound + 1;
            let matchOrder = 1;
            for (let i = 0; i < winners.length; i += 2) {
                const gameId = await gameRepository.createGameAndAddPlayers('tournament', [
                    { user_id: winners[i], position: 1 },
                    { user_id: winners[i + 1], position: 2 }
                ]);

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
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },

    async getTournamentGames(tournament_id: number): Promise<TournamentGame[]> {
        return db.all<TournamentGame>(
            `SELECT * FROM tournament_games 
             WHERE tournament_id = ? 
             ORDER BY round ASC, match_order ASC`,
            [tournament_id]
        );
    },

    async getRoundGames(tournament_id: number, round: number): Promise<TournamentGame[]> {
        return db.all<TournamentGame>(
            `SELECT * FROM tournament_games 
             WHERE tournament_id = ? AND round = ? 
             ORDER BY match_order ASC`,
            [tournament_id, round]
        );
    },

    async cancelTournament(tournament_id: number): Promise<void> {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status === 'finished') throw new Error("Cannot cancel a finished tournament");

        await db.run(
            `UPDATE tournaments 
             SET status = 'cancelled', ended_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [tournament_id]
        );
    },

    async getBracket(tournament_id: number) {
        const tournament = await this.getTournament(tournament_id);
        if (!tournament) throw new Error("Tournament not found");

        // This query joins games, players, and users to get all match data
        const games = await db.all<any>(
            `SELECT 
                tg.round, tg.match_order, g.id as game_id, g.status, g.winner_id,
                gp1.user_id as player1_id, u1.username as player1_name, COALESCE(gp1.score, 0) as player1_score,
                gp2.user_id as player2_id, u2.username as player2_name, COALESCE(gp2.score, 0) as player2_score
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
