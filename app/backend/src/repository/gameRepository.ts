import db from "../../db/db";

import {
    Game,
    RecentMatch,
    XPProgressPoint,
    MatchDetail,
    TopPlayer,
    PlayerStats,
    GlobalMatch
} from "../types/game.types";

const gameRepository = {

    async createGame(mode: 'remote' | 'tournament'): Promise<number> {
        const result = await db.run(
            `INSERT INTO games (mode, status) 
            VALUES (?, 'waiting')`,
            [mode]
        );
        return result.lastID;
    },

    async addPlayer(gameId: number, userId: number, position: 1 | 2): Promise<void> {
        await db.run(
            `INSERT INTO game_players (game_id, user_id, position, score, xp_gained) 
             VALUES (?, ?, ?, 0, 0)`,
            [gameId, userId, position]
        );
    },

    async getPlayers(game_id: number): Promise<number[]> {
        const rows = await db.all<{ user_id: number }>(
            `SELECT user_id FROM game_players WHERE game_id = ?`,
            [game_id]
        );
        return rows.map(row => row.user_id);
    },

    async getPlayerScores(game_id: number): Promise<Array<{ user_id: number; score: number }>> {
        return await db.all<{ user_id: number; score: number }>(
            `SELECT user_id, score FROM game_players WHERE game_id = ?`,
            [game_id]
        );
    },

    async getWinner(game_id: number): Promise<number | null> {
        const result = await db.get<{ winner_id: number | null }>(
            `SELECT winner_id FROM games WHERE id = ?`,
            [game_id]
        );
        return result?.winner_id ?? null;
    },

    async getTopPlayers(limit: number = 10): Promise<TopPlayer[]> {
        return db.all<TopPlayer>(
            `
        SELECT
            u.id,
            u.username,
            (u.image_src || u.profile_picture) AS profile_picture,
            ps.wins,
            ps.total_xp,
            ps.level,
            ps.losses,
            ps.games_played,
            ub.badge_name,
            ub.badge_icon
        FROM users u
        INNER JOIN player_stats ps ON ps.user_id = u.id
        LEFT JOIN user_badges ub ON ub.user_id = u.id
        WHERE ps.games_played > 0
        GROUP BY u.id
        ORDER BY ps.wins DESC, ps.total_xp DESC
        LIMIT ?
        `,
            [limit]
        );
    },

    async getPlayerStats(userId: number): Promise<PlayerStats> {
        await db.run(
            `INSERT OR IGNORE INTO player_stats (user_id) VALUES (?)`,
            [userId]
        );
        const stats = await db.get<PlayerStats>(
            `SELECT 
            user_id,
            level,
            total_xp,
            wins,
            losses,
            games_played,
            CASE 
                WHEN games_played = 0 THEN 0
                ELSE ROUND(wins * 100.0 / games_played, 2)
            END as win_rate
         FROM player_stats
         WHERE user_id = ?`,
            [userId]
        );
        return stats!;
    },

    async getRecentMatches(userId: number, limit: number = 10, offset: number = 0): Promise<RecentMatch[]> {
        return db.all<RecentMatch>(
            `
        SELECT
            g.id,
            g.mode,
            gp1.score AS player1_score,
            u1.username AS player1_username,
            (u1.image_src || u1.profile_picture) AS player1_profile_picture,
            gp2.score AS player2_score,
            u2.username AS player2_username,
            (u2.image_src || u2.profile_picture) AS player2_profile_picture
        FROM games g
        JOIN game_players gp1
          ON g.id = gp1.game_id AND gp1.position = 1
        JOIN users u1
          ON gp1.user_id = u1.id
        JOIN game_players gp2
          ON g.id = gp2.game_id AND gp2.position = 2
        JOIN users u2
          ON gp2.user_id = u2.id
        WHERE g.status = 'finished'
          AND (gp1.user_id = ? OR gp2.user_id = ?)
        ORDER BY g.ended_at DESC
        LIMIT ? OFFSET ?
        `,
            [userId, userId, limit, offset]
        );
    },

    async getRecentGlobalMatches(limit: number = 10, offset: number = 0): Promise<GlobalMatch[]> {
        return db.all<GlobalMatch>(
            `
        SELECT
            g.id,
            g.mode,
            gp1.score AS player1_score,
            u1.username AS player1_username,
            (u1.image_src || u1.profile_picture) AS player1_profile_picture,
            gp2.score AS player2_score,
            u2.username AS player2_username,
            (u2.image_src || u2.profile_picture) AS player2_profile_picture
        FROM games g
        JOIN game_players gp1
          ON g.id = gp1.game_id AND gp1.position = 1
        JOIN users u1
          ON gp1.user_id = u1.id
        JOIN game_players gp2
          ON g.id = gp2.game_id AND gp2.position = 2
        JOIN users u2
          ON gp2.user_id = u2.id
        WHERE g.status = 'finished'
        ORDER BY g.ended_at DESC
        LIMIT ? OFFSET ?
        `, [limit, offset]
        );
    },

    async getMatchDetail(gameId: number): Promise<MatchDetail | undefined> {
        return await db.get<MatchDetail>(
            `SELECT 
            g.id,
            g.mode,
            g.status,
            g.winner_id,
            g.started_at,
            g.ended_at,
            tm.tournament_id,
            
            gp1.user_id AS player1_id,
            u1.username AS player1_username,
            (u1.image_src || u1.profile_picture) as player1_avatar,
            gp1.score AS player1_score,
            gp1.xp_gained AS player1_xp_gained,
            
            gp2.user_id AS player2_id,
            u2.username AS player2_username,
            (u2.image_src || u2.profile_picture) as player2_avatar,
            gp2.score AS player2_score,
            gp2.xp_gained AS player2_xp_gained
            
        FROM games g
        LEFT JOIN game_players gp1 ON gp1.game_id = g. id AND gp1.position = 1
        LEFT JOIN users u1 ON gp1.user_id = u1.id
        LEFT JOIN game_players gp2 ON gp2.game_id = g.id AND gp2.position = 2
        LEFT JOIN users u2 ON gp2.user_id = u2.id
        LEFT JOIN tournament_matches tm ON tm.game_id = g.id
        WHERE g.id = ?`,
            [gameId]
        );
    },

    async getUserXPProgression(userId: number, limit = 30): Promise<XPProgressPoint[]> {
        return db.all<XPProgressPoint>(
            `
        SELECT
            SUM(gp.xp_gained) OVER (ORDER BY g.ended_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS total_xp,
            gp.xp_gained,
            CAST(SUM(gp.xp_gained) OVER (ORDER BY g.ended_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS REAL) / 1000 AS level,
            g.ended_at AS created_at
        FROM game_players gp
        JOIN games g ON g.id = gp.game_id
        WHERE gp.user_id = ?
          AND g.status = 'finished'
          AND g.ended_at IS NOT NULL
        ORDER BY g.ended_at ASC
        LIMIT ?
        `,
            [userId, limit]
        );
    },

    async findById(id: number): Promise<Game | null> {
        const game = await db.get(`SELECT * FROM games WHERE id = ? `, [id]);
        return (game as Game) || null;
    },


    async start(game_id: number): Promise<void> {
        await db.run(
            `UPDATE games SET status = 'playing', started_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [game_id]
        );
    },

    async SetPlayerScore(game_id: number, position: number, score: number): Promise<void> {
        await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND position = ?`,
            [score, game_id, position]
        );
    },

    async finishGame(game_id: number, winner_id: number | null): Promise<void> {
        await db.run(
            `UPDATE games SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [winner_id, game_id]
        );
    },

    async updatePlayerXpGained(gameId: number, userId: number, xpGained: number): Promise<void> {
        await db.run(
            `UPDATE game_players 
             SET xp_gained = ?
             WHERE game_id = ? AND user_id = ?`,
            [xpGained, gameId, userId]
        );
    },

    async updateStatus(game_id: number, status: 'waiting' | 'playing' | 'finished'): Promise<void> {
        await db.run(
            `UPDATE games SET status = ? WHERE id = ?`,
            [status, game_id]
        );
    },


    async updateStats(userId: number, xpGained: number, won: boolean): Promise<void> {
        await db.run(
            `INSERT OR IGNORE INTO player_stats (user_id) VALUES (?)`,
            [userId]
        );
        await db.run(
            `UPDATE player_stats 
             SET total_xp = total_xp + ?,
                 level = (total_xp + ?) / 1000,
                 wins = wins + ?,
                 losses = losses + ?,
                 games_played = games_played + 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [xpGained, xpGained, won ? 1 : 0, won ? 0 : 1, userId]
        );
    },

    async getTotalXP(userId: number): Promise<number> {
        const result = await db.get<{ total_xp: number }>(
            `SELECT total_xp FROM player_stats WHERE user_id = ?`,
            [userId]
        );

        return result?.total_xp ?? 0;
    },

    async upsertBadge(userId: number, badgeName: string, badgeIcon: string): Promise<void> {
        const currentBadge = await db.get<{ badge_name: string; badge_icon: string }>(
            `SELECT badge_name, badge_icon FROM user_badges WHERE user_id = ?`,
            [userId]
        );
        if (currentBadge?.badge_name === badgeName && currentBadge?.badge_icon === badgeIcon) {
            return;
        }
        await db.run(
            `INSERT OR REPLACE INTO user_badges (user_id, badge_name, badge_icon)
            VALUES (?, ?, ?)`,
            [userId, badgeName, badgeIcon]
        );
    },


};

export default gameRepository;
