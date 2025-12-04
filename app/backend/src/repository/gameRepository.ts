import db from "../../db/db";

import { Game, GamePlayer, GameMode, GameStatus, } from '../types/gameTypes';

export interface MatchHistoryItemData {
    matchId: number;
    mode: GameMode;
    date: string;       // This will be the 'ended_at' timestamp
    isWin: boolean;
    user_score: number;
    opponent_score: number;
    opponent_name: string | null; // Opponent's name (or null if AI/local)
    opponent_avatar: string | null; // Opponent's avatar (or null)
}


export type UserStats = {
    wins: number;
    losses: number;
    winRate: number; // percent (0-100)
    score: number;   // wins*3 - losses
    rank: number | null;
};

const gameRepository = {

    async getUserScoreProgression(userId: number, limit = 10): Promise<Array<{ matchId: number, date: string, score: number }>> {
        const sql = `
        SELECT g.id AS matchId, g.ended_at AS date,
            (
                SELECT SUM(
                    CASE
                        WHEN g2.status = 'finished' AND g2.mode IN ('remote', 'tournament') AND g2.winner_id = gp2.user_id THEN 3
                        WHEN g2.status = 'finished' AND g2.mode IN ('remote', 'tournament') AND gp2.user_id IS NOT NULL THEN -1
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
        return rows.reverse(); // oldest to newest (for chart)
    },

    async getUserStats(userId: number): Promise<UserStats | null> {
        if (!userId || Number.isNaN(userId)) return null;

        // First, get wins and losses
        const statsSql = `
        SELECT
            u.id AS user_id,
            COALESCE(SUM(CASE WHEN g. status = 'finished' AND g.winner_id = u.id THEN 1 ELSE 0 END), 0) AS wins,
            COALESCE(SUM(CASE 
                WHEN g.status = 'finished' 
                AND gp.user_id = u. id 
                AND (g. winner_id IS NULL OR g. winner_id != u.id) 
                THEN 1 ELSE 0 
            END), 0) AS losses
        FROM users u
        LEFT JOIN game_players gp ON gp. user_id = u.id
        LEFT JOIN games g ON g. id = gp.game_id
        WHERE u.id = ?
        GROUP BY u.id
    `;

        const rows = await db.all(statsSql, [userId]);

        if (!rows || rows.length === 0) {
            // User exists but has no games played
            return {
                wins: 0,
                losses: 0,
                winRate: 0,
                score: 0,
                rank: null,
            };
        }

        const row = rows[0];
        const wins = Number(row.wins ?? 0);
        const losses = Number(row.losses ?? 0);
        const totalGames = wins + losses;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100 * 100) / 100 : 0;
        const score = wins * 3 - losses;

        // Calculate rank: count how many users have a better score
        const rankSql = `
        WITH user_scores AS (
            SELECT
                u.id AS user_id,
                (COALESCE(SUM(CASE WHEN g.status = 'finished' AND g.winner_id = u.id THEN 1 ELSE 0 END), 0) * 3 
                - COALESCE(SUM(CASE 
                    WHEN g.status = 'finished' 
                    AND gp.user_id = u. id 
                    AND (g.winner_id IS NULL OR g.winner_id != u.id) 
                    THEN 1 ELSE 0 
                END), 0)) AS score
            FROM users u
            LEFT JOIN game_players gp ON gp.user_id = u.id
            LEFT JOIN games g ON g.id = gp.game_id
            GROUP BY u.id
        )
        SELECT COUNT(*) + 1 AS rank
        FROM user_scores
        WHERE score > ?
    `;

        const rankRows = await db.all(rankSql, [score]);
        const rank = rankRows && rankRows.length > 0 ? Number(rankRows[0].rank) : null;

        return {
            wins,
            losses,
            winRate,
            score,
            rank,
        };
    },
    async getRecentGlobalMatches(limit: number = 10): Promise<any[]> {
        return await db.all(
            `SELECT 
            g.id as game_id,
            g. mode,
            g.winner_id,
            g.ended_at,
            g.created_at,
            -- Player 1 details
            gp1.score as player1_score,
            u1.username as player1_name,
            u1.profile_picture as player1_avatar,
            -- Player 2 details
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
    },
    async createGame(mode: GameMode): Promise<number> {
        const result = await db.run(`INSERT INTO games (mode, status) VALUES (?, 'waiting')`, [mode]);
        return result.lastID as number;
    },

    async getGameById(id: number): Promise<Game | undefined> {
        return await db.get(`SELECT * FROM games WHERE id = ?`, [id]);
    },

    async getGamePlayers(game_id: number): Promise<GamePlayer[]> {
        return await db.all(
            `SELECT * FROM game_players WHERE game_id = ? ORDER BY position ASC`,
            [game_id]
        );
    },


    async addPlayerToGame(game_id: number, user_id: number | null, position: number): Promise<number> {
        const result = await db.run(
            `INSERT INTO game_players (game_id, user_id, position) VALUES (?, ?, ?)`,
            [game_id, user_id, position]
        );
        return result.lastID as number;
    },

    async updatePlayerScore(game_id: number, user_id: number, score: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND user_id = ?`,
            [score, game_id, user_id]
        );
        return result.changes > 0;
    },

    async updatePlayerScoreByPosition(game_id: number, position: number, score: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND position = ?`,
            [score, game_id, position]
        );
        return result.changes > 0;
    },


    async startGame(game_id: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE games SET status = 'playing', started_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'waiting'`,
            [game_id]
        );
        return result.changes > 0;
    },

    async finishGame(game_id: number, winner_id: number | null): Promise<boolean> {
        const result = await db.run(
            `UPDATE games SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [winner_id, game_id]
        );
        return result.changes > 0;
    },

    async cancelGame(game_id: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE games SET status = 'cancelled', ended_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('waiting', 'playing')`,
            [game_id]
        );
        return result.changes > 0;
    },

    async getGamesByStatus(status: GameStatus, mode?: GameMode): Promise<Game[]> {
        if (mode) {
            return await db.all(
                `SELECT * FROM games WHERE status = ? AND mode = ? ORDER BY created_at DESC`,
                [status, mode]
            );
        } else {
            return await db.all(
                `SELECT * FROM games WHERE status = ? ORDER BY created_at DESC`,
                [status]
            );
        }
    },

    async getGameWithPlayers(gameId: number) {
        const game = await db.get(`SELECT * FROM games WHERE id = ?`, [gameId]);
        if (!game)
            return null;

        const players = await db.all(`SELECT gp.*, u.username, u.profile_picture as avatar 
         FROM game_players gp
         LEFT JOIN users u ON gp.user_id = u.id 
         WHERE gp.game_id = ?
         ORDER BY gp.position ASC`,
            [gameId]
        );

        return { ...game, players };
    },

    async getUserGames(user_id: number): Promise<Game[]> {
        return await db.all(
            `SELECT g.* FROM games g JOIN game_players gp ON gp.game_id = g.id
       WHERE gp.user_id = ? ORDER BY g.created_at DESC`,
            [user_id]
        );
    },


    async createGameAndAddPlayers(mode: GameMode, players: { user_id: number | null, position: number }[]): Promise<number> {
        const gameResult = await db.run(
            `INSERT INTO games (mode, status) VALUES (?, 'waiting')`,
            [mode]
        );
        const gameId = gameResult.lastID as number;
        if (!gameId)
            throw new Error("Failed to create game, no ID returned.");

        for (const player of players) {
            await db.run(
                `INSERT INTO game_players (game_id, user_id, position) VALUES (?, ?, ?)`,
                [gameId, player.user_id ?? null, player.position]
            );
        }
        return gameId;
    },

    async getMatchHistoryForUser(userId: number): Promise<MatchHistoryItemData[]> {
        const sql = `
            SELECT
                g.id as matchId,
                g.mode,
                g.ended_at as date,
                (g.winner_id = gp_user.user_id) as isWin,
                gp_user.score as user_score,
                gp_opponent.score as opponent_score,
                u_opponent.username as opponent_name,
                u_opponent.profile_picture as opponent_avatar
            FROM
                game_players AS gp_user
            JOIN
                games AS g ON gp_user.game_id = g.id
            LEFT JOIN
                game_players AS gp_opponent ON gp_user.game_id = gp_opponent.game_id AND gp_user.id != gp_opponent.id
            LEFT JOIN
                users AS u_opponent ON gp_opponent.user_id = u_opponent.id
            WHERE
                gp_user.user_id = ? AND g.status = 'finished'
            ORDER BY
                g.ended_at DESC
        `;

        return db.all<MatchHistoryItemData>(sql, [userId]);
    },

    async getGameDetails(gameId: number): Promise<Game | undefined> {
        return await db.get(`SELECT * FROM games WHERE id = ?`, [gameId]);
    }
};

export default gameRepository;
