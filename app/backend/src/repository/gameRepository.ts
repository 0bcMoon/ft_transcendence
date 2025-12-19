// repository/gameRepository.ts

import db from "../../db/db";

import {
    Game,
    GamePlayer,
    GamePlayerWithUser,
    GameWithPlayers,
    PlayerData,
    ScoreProgressionPoint,
    RecentMatch,
    MatchHistoryItem,
    GameMode,
    GameStatus,
    EloProgressPoint,
    GameDetail,
    GamePlayerDetail
} from "../types/game.types";

const gameRepository = {

    async getGameDetail(gameId: number): Promise<GameDetail | undefined> {
        return await db.get<GameDetail>(
            `SELECT id, mode, status, winner_id, started_at, ended_at, created_at
       FROM games
       WHERE id = ?`,
            [gameId]
        );
    },

    async getGamePlayers(gameId: number): Promise<GamePlayerDetail[]> {
        const players = await db.all<{
            position: number;
            user_id: number | null;
            username: string | null;
            display_name: string | null;
            profile_picture: string | null;
            image_src: string | null;
            score: number | null;
            is_ai: number;
            joined_at: string;
            elo_change: number | null;
            new_elo: number | null;
            result: string | null;
        }>(
            `SELECT
                gp.position,
                gp.user_id,
                u.username,
                u.display_name,
                u.profile_picture,
                u.image_src,
                gp.score,
                gp.is_ai,
                gp.joined_at,
                eh.elo_change,
                eh.new_elo,
                eh.result
            FROM game_players gp
            LEFT JOIN users u ON gp.user_id = u.id
            LEFT JOIN elo_history eh ON eh.game_id = gp.game_id AND eh.user_id = gp.user_id
            WHERE gp.game_id = ?
            ORDER BY gp.position ASC`,
            [gameId]
        );

        return players.map(p => ({
            position: p.position,
            user_id: p.user_id,
            username: p.username,
            display_name: p.display_name,
            profile_picture: p.profile_picture,
            image_src: p.image_src,
            score: p.score,
            is_ai: !!p.is_ai,
            joined_at: p.joined_at,
            elo_change: p.elo_change ?? null,
            new_elo: p.new_elo ?? null,
            result: p.result ?? null,
        }));
    },

    async getUserEloProgression(userId: number, limit = 30): Promise<EloProgressPoint[]> {
        const rows = await db.all<EloProgressPoint>(
            `
        SELECT new_elo, created_at
        FROM elo_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
        `,
            [userId, limit]
        );
        return rows.reverse();
    },

    async getPlayerStatsSummary(userId: number) {
        // 1. Get user stats including elo_rating
        const row = await db.get<{
            wins: number;
            losses: number;
            rank: string;
            elo_rating: number;
        }>(`
    SELECT wins, losses, rank, elo_rating
    FROM player_stats
    WHERE user_id = ?
  `, [userId]);

        if (!row) throw new Error("Player stats not found");

        const { wins, losses, rank, elo_rating } = row;
        const totalGames = wins + losses;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

        // 2. Get number of users with higher ELO (better score)
        const leaderboardRow = await db.get<{ better_count: number }>(`
    SELECT COUNT(*) AS better_count
    FROM player_stats
    WHERE elo_rating > ?
  `, [elo_rating]);

        // 3. Leaderboard position is "better_count" users + yourself (+1 for 1-based rank)
        const leaderboardPosition = (leaderboardRow?.better_count ?? 0) + 1;

        return {
            wins,
            losses,
            winRate,
            rank,
            leaderboardPosition
        };
    },
    async getRecentMatches(userId: number, limit: number = 10): Promise<RecentMatch[]> {
        try {
            if (!userId || Number.isNaN(userId)) {
                throw new Error('Invalid userId passed to getRecentMatches');
            }

            const sql = `
        SELECT
          g.id,
          g.mode,
          g.winner_id,
          g.ended_at,
          g.created_at,
          gp1.user_id AS player1_id,
          gp1.score AS player1_score,
          u1.display_name AS player1_name,
          u1.profile_picture AS player1_avatar,
          gp2.user_id AS player2_id,
          gp2.score AS player2_score,
          u2.display_name AS player2_name,
          u2.profile_picture AS player2_avatar
        FROM games g
        INNER JOIN game_players gp1 ON g.id = gp1.game_id AND gp1.position = 1
        INNER JOIN game_players gp2 ON g.id = gp2.game_id AND gp2.position = 2
        LEFT JOIN users u1 ON gp1.user_id = u1.id
        LEFT JOIN users u2 ON gp2.user_id = u2.id
        WHERE (gp1.user_id = ? OR gp2.user_id = ?)
          AND g.status = 'finished'
          AND g.mode IN ('remote', 'tournament')
        ORDER BY COALESCE(g.ended_at, g.created_at) DESC
        LIMIT ?
      `;

            const rows = await db.all(sql, [userId, userId, limit]);
            return Array.isArray(rows) ? (rows as RecentMatch[]) : [];
        } catch (err) {
            console.error('gameRepository.getRecentMatches error:', (err as Error).message);
            throw err;
        }
    },

    async getUserScoreProgression(
        userId: number,
        limit = 10
    ): Promise<ScoreProgressionPoint[]> {
        const sql = `
            SELECT
                g.id AS matchId,
                g.ended_at AS date,
                (
                    SELECT SUM(
                        CASE
                            WHEN g2.status = 'finished' AND g2.mode IN ('remote', 'tournament') AND g2.winner_id = gp2.user_id THEN 3
                            WHEN g2.status = 'finished' AND g2.mode IN ('remote', 'tournament') AND gp2.user_id IS NOT NULL AND g2.winner_id != gp2.user_id THEN -1
                            ELSE 0
                        END
                    )
                    FROM games g2
                    JOIN game_players gp2 ON gp2.game_id = g2.id
                    WHERE gp2.user_id = ?  
                      AND g2.status = 'finished'
                      AND g2.mode IN ('remote', 'tournament')
                      AND g2.ended_at <= g.ended_at
                ) AS score
            FROM game_players gp
            JOIN games g ON g.id = gp.game_id
            WHERE gp.user_id = ? 
              AND g.status = 'finished'
              AND g.mode IN ('remote', 'tournament')
            ORDER BY g.ended_at DESC
            LIMIT ?
        `;
        const rows = await db.all(sql, [userId, userId, limit]);
        return (rows as ScoreProgressionPoint[]).reverse();
    },


    /**
     * Get recent global matches
     */
    async getRecentGlobalMatches(limit: number = 10): Promise<RecentMatch[]> {
        const matches = await db.all(
            `SELECT 
                g.id as game_id,
                g.mode,
                g.winner_id,
                g.ended_at,
                g.created_at,
                gp1.score as player1_score,
                u1.username as player1_name,
                u1.profile_picture as player1_avatar,
                gp2.score as player2_score,
                u2.username as player2_name,
                u2.profile_picture as player2_avatar
            FROM games g
            LEFT JOIN game_players gp1 ON g.id = gp1.game_id AND gp1.position = 1
            LEFT JOIN users u1 ON gp1.user_id = u1.id
            LEFT JOIN game_players gp2 ON g. id = gp2.game_id AND gp2.position = 2
            LEFT JOIN users u2 ON gp2.user_id = u2.id
            WHERE g.mode IN ('remote', 'tournament')
                AND g.status = 'finished'
            ORDER BY g.ended_at DESC
            LIMIT ?`,
            [limit]
        );

        return matches as RecentMatch[];
    },

    /**
     * Create game and add players
     */
    async createGameAndAddPlayers(
        mode: GameMode,
        players: PlayerData[]
    ): Promise<number> {
        const gameResult = await db.run(
            `INSERT INTO games (mode, status, created_at) VALUES (?, 'waiting', CURRENT_TIMESTAMP)`,
            [mode]
        );
        const gameId = gameResult.lastID as number;

        if (!gameId) {
            throw new Error("Failed to create game, no ID returned.");
        }

        for (const player of players) {
            await db.run(
                `INSERT INTO game_players (game_id, user_id, position, score, is_ai) VALUES (?, ?, ?, 0, ?)`,
                [gameId, player.user_id ?? null, player.position, player.is_ai ? 1 : 0]
            );
        }

        console.log(`✅ Created ${mode} game ${gameId}`);
        return gameId;
    },

    /**
     * Find game by ID
     */
    async findById(id: number): Promise<Game | null> {
        const game = await db.get(`SELECT * FROM games WHERE id = ? `, [id]);
        return (game as Game) || null;
    },

    /**
     * Get game players
     */
    async getPlayers(game_id: number): Promise<GamePlayer[]> {
        const players = await db.all(
            `SELECT * FROM game_players WHERE game_id = ?  ORDER BY position ASC`,
            [game_id]
        );
        return players as GamePlayer[];
    },

    /**
     * Get game with players (including user info)
     */
    async getGameWithPlayers(gameId: number): Promise<GameWithPlayers | null> {
        const game = await db.get(`SELECT * FROM games WHERE id = ?`, [gameId]);
        if (!game) return null;

        const players = await db.all(
            `SELECT gp.*, u.username, u.profile_picture as avatar 
             FROM game_players gp
             LEFT JOIN users u ON gp.user_id = u.id 
             WHERE gp.game_id = ?  
             ORDER BY gp.position ASC`,
            [gameId]
        ) as GamePlayerWithUser[];

        return { ...(game as Game), players };
    },

    /**
     * Start game
     */
    async start(game_id: number): Promise<void> {
        const game = await this.findById(game_id);
        if (!game) throw new Error("Game not found");
        if (game.status !== 'waiting') throw new Error("Game already started");

        await db.run(
            `UPDATE games SET status = 'playing', started_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [game_id]
        );

        console.log(`▶️ Game ${game_id} started`);
    },

    /**
     * Update player score by position
     */
    async updatePlayerScore(game_id: number, position: number, score: number): Promise<void> {
        if (position !== 1 && position !== 2) {
            throw new Error("Position must be 1 or 2");
        }

        const result = await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND position = ?`,
            [score, game_id, position]
        );

        if (result.changes === 0) {
            throw new Error(`Player at position ${position} not found in game ${game_id}`);
        }

        console.log(`   Updated player ${position} score to ${score} in game ${game_id}`);
    },

    /**
     * Finish game
     */
    async finish(game_id: number, winner_id: number | null): Promise<void> {
        const game = await this.findById(game_id);
        if (!game) throw new Error("Game not found");
        if (game.status === 'finished') throw new Error("Game already finished");

        await db.run(
            `UPDATE games SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [winner_id, game_id]
        );

        console.log(`🏁 Game ${game_id} finished.  Winner: ${winner_id || 'none'}`);
    },

    /**
     * Cancel game
     */
    async cancel(game_id: number): Promise<void> {
        const game = await this.findById(game_id);
        if (!game) throw new Error("Game not found");
        if (game.status === 'finished') throw new Error("Cannot cancel finished game");

        await db.run(
            `UPDATE games SET status = 'cancelled', ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [game_id]
        );

        console.log(`❌ Game ${game_id} cancelled`);
    },

    /**
     * Get games by status
     */
    async getGamesByStatus(status: GameStatus, mode?: GameMode): Promise<Game[]> {
        if (mode) {
            return await db.all(
                `SELECT * FROM games WHERE status = ? AND mode = ? ORDER BY created_at DESC`,
                [status, mode]
            ) as Game[];
        } else {
            return await db.all(
                `SELECT * FROM games WHERE status = ? ORDER BY created_at DESC`,
                [status]
            ) as Game[];
        }
    },

    /**
     * Get user games
     */
    async getUserGames(user_id: number): Promise<Game[]> {
        return await db.all(
            `SELECT g.* FROM games g 
             JOIN game_players gp ON gp.game_id = g. id
             WHERE gp.user_id = ?  
             ORDER BY g.created_at DESC`,
            [user_id]
        ) as Game[];
    },

    /**
     * Get match history for user
     */
    async getMatchHistoryForUser(userId: number): Promise<MatchHistoryItem[]> {
        const sql = `
            SELECT
                g.id as matchId,
                g.mode,
                g.ended_at as date,
                (g.winner_id = gp_user.user_id) as isWin,
                gp_user. score as user_score,
                gp_opponent.score as opponent_score,
                u_opponent.username as opponent_name,
                u_opponent.profile_picture as opponent_avatar
            FROM game_players AS gp_user
            JOIN games AS g ON gp_user.game_id = g.id
            LEFT JOIN game_players AS gp_opponent 
                ON gp_user.game_id = gp_opponent. game_id 
                AND gp_user. id != gp_opponent.id
            LEFT JOIN users AS u_opponent ON gp_opponent.user_id = u_opponent.id
            WHERE gp_user.user_id = ?  AND g.status = 'finished'
            ORDER BY g.ended_at DESC
        `;

        return (await db.all(sql, [userId])) as MatchHistoryItem[];
    },
    async getPlayerStats(userId: number) {
        let stats = await db.get(
            `SELECT * FROM player_stats WHERE user_id = ? LIMIT 1`,
            [userId]
        );
        if (!stats) {
            // Auto-create stats if missing
            await db.run(`INSERT INTO player_stats (user_id) VALUES (?)`, [userId]);
            stats = await db.get(
                `SELECT * FROM player_stats WHERE user_id = ? LIMIT 1`,
                [userId]
            );
            console.log(`[player_stats] Auto-created for user ${userId}`);
        }
        return stats;
    },

    /**
     * Update player ELO, rank, wins, and losses
     */
    async updatePlayerStats(
        userId: number,
        elo_rating: number,
        rank: string,
        wins: number,
        losses: number
    ) {
        await db.run(
            `UPDATE player_stats SET elo_rating = ?, rank = ?, wins = ?, losses = ? WHERE user_id = ?`,
            [elo_rating, rank, wins, losses, userId]
        );
    },

    /**
     * Set ELO and optionally rank only (shortcut)
     */
    async setPlayerElo(userId: number, elo_rating: number, rank?: string) {
        if (rank) {
            await db.run(
                `UPDATE player_stats SET elo_rating = ?, rank = ? WHERE user_id = ?`,
                [elo_rating, rank, userId]
            );
        } else {
            await db.run(
                `UPDATE player_stats SET elo_rating = ? WHERE user_id = ?`,
                [elo_rating, userId]
            );
        }
    },

    /**
     * Increment wins/losses for user (optional shortcut)
     */
    async incrementPlayerWin(userId: number) {
        await db.run(
            `UPDATE player_stats SET wins = wins + 1 WHERE user_id = ?`,
            [userId]
        );
    },
    async incrementPlayerLoss(userId: number) {
        await db.run(
            `UPDATE player_stats SET losses = losses + 1 WHERE user_id = ?`,
            [userId]
        );
    },

    // ======================
    // ELO_HISTORY methods
    // ======================

    /**
     * Insert an ELO event (after match)
     * @param entry object: { user_id, game_id, elo_change, new_elo, result }
     */
    async insertEloHistory(entry: {
        user_id: number;
        game_id?: number | null;
        elo_change: number;
        new_elo: number;
        result: "win" | "loss" | "draw";
    }) {
        await db.run(
            `INSERT INTO elo_history (user_id, game_id, elo_change, new_elo, result)
             VALUES (?, ?, ?, ?, ?)`,
            [
                entry.user_id,
                entry.game_id ?? null,
                entry.elo_change,
                entry.new_elo,
                entry.result,
            ]
        );
    },

    /**
     * Get ELO history for a user
     */
    async getEloHistory(userId: number, limit: number = 20) {
        const rows = await db.all(
            `SELECT * FROM elo_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
            [userId, limit]
        );
        return rows;
    },

    /**
     * Get a user's most recent ELO value
     */
    async getLastElo(userId: number): Promise<number | null> {
        const row = await db.get(
            `SELECT new_elo FROM elo_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );
        return row ? row.new_elo : null;
    },

    async getTopPlayers(limit: number = 10) {
        const sql = `
        SELECT
            u.id AS user_id,
            u.username,
            u.display_name,
            u.profile_picture AS avatar,
            ps.elo_rating,
            ps.rank,
            ps.wins,
            ps.losses
        FROM player_stats ps
        JOIN users u ON ps.user_id = u.id
        ORDER BY ps.elo_rating DESC
        LIMIT ?
    `;
        const rows = await db.all(sql, [limit]);
        return rows;
    }

};

export default gameRepository;
