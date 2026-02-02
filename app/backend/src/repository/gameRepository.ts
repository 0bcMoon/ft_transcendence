import db from "../../db/db";

import {
    Game,
    GamePlayer,
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


    async getTopPlayers(limit: number = 10): Promise<TopPlayer[]> {
        return db.all<TopPlayer>(
            `
        SELECT
            u.id,
            u.username,
            (u.image_src || u.profile_picture) AS profile_picture,
            COUNT(g.id) AS wins,
            ps.total_xp,
            ub.badge_name,
            ub.badge_icon
        FROM users u
        JOIN games g ON g.winner_id = u.id
        LEFT JOIN player_stats ps ON ps.user_id = u.id
        LEFT JOIN user_badges ub ON ub.user_id = u.id
        WHERE g.status = 'finished'
        GROUP BY u.id
        ORDER BY wins DESC
        LIMIT ?
        `,
            [limit]
        );
    },

    async getPlayerStats(userId: number): Promise<PlayerStats | null> {
        const stats = await db.get<PlayerStats>(
            `SELECT 
            ps.user_id,
            ps.level,
            ps.total_xp,
            ps.wins,
            ps.losses,
            ps.games_played,
            ROUND(CAST(ps.wins AS REAL) / NULLIF(ps.games_played, 0) * 100, 2) as win_rate,
            ub.badge_name,
            ub.badge_icon
         FROM player_stats ps
         LEFT JOIN user_badges ub ON ps.user_id = ub.user_id
         WHERE ps.user_id = ?
         LIMIT 1`,
            [userId]
        );

        return stats || null;
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

    async getPlayers(game_id: number): Promise<GamePlayer[]> {
        const players = await db.all(
            `SELECT * FROM game_players WHERE game_id = ?  ORDER BY position ASC`,
            [game_id]
        );
        return players as GamePlayer[];
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

    async calculateAndStoreXP(gameId: number, winnerId: number | null): Promise<void> {
        const XP_RULES = { WIN: 100, LOSS: 30, PER_POINT: 5, };

        const players = await db.all<{ user_id: number; score: number; position: number }>(
            `SELECT user_id, score, position FROM game_players WHERE game_id = ? `,
            [gameId]
        );

        if (players.length === 0)
            return;

        for (const player of players) {
            if (!player.user_id)
                continue;
            const isWinner = player.user_id === winnerId;
            const baseXP = isWinner ? XP_RULES.WIN : XP_RULES.LOSS;
            const bonusXP = player.score * XP_RULES.PER_POINT;
            const totalXP = baseXP + bonusXP;

            await db.run(
                `UPDATE game_players 
                SET xp_gained = ?  
                WHERE game_id = ? AND user_id = ?`,
                [totalXP, gameId, player.user_id]
            );

            await db.run(
                `UPDATE player_stats 
                SET total_xp = total_xp + ?,
                    level = (total_xp + ?) / 1000.0
                WHERE user_id = ?`,
                [totalXP, totalXP, player.user_id]
            );
        }
    },

    async finishGame(game_id: number, winner_id: number | null): Promise<void> {
        await db.run(
            `UPDATE games SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [winner_id, game_id]
        );
        await this.calculateAndStoreXP(game_id, winner_id);
    },

    async updateStatus(game_id: number, status: 'waiting' | 'playing' | 'finished'): Promise<void> {
        await db.run(
            `UPDATE games SET status = ? WHERE id = ?`,
            [status, game_id]
        );
    },

    // async cancel(game_id: number): Promise<void> {
    //     await db.run(
    //         `UPDATE games SET status = 'cancelled', ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
    //         [game_id]
    //     );
    // },

    /**
     * Update player ELO, rank, wins, and losses
     */
    async updatePlayerStats(
        userId: number,
        totalXp: number,
        level: number,
        wins: number,
        losses: number,
        gamesPlayed: number
    ): Promise<void> {
        await db.run(
            `INSERT INTO player_stats (user_id, total_xp, level, wins, losses, games_played, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id) DO UPDATE SET
             total_xp = excluded.total_xp,
             level = excluded.level,
             wins = excluded.wins,
             losses = excluded.losses,
             games_played = excluded. games_played,
             updated_at = CURRENT_TIMESTAMP`,
            [userId, totalXp, level, wins, losses, gamesPlayed]
        );
    },

    async getUserBadge(userId: number): Promise<{ badge_name: string; badge_icon: string } | undefined> {
        return await db.get<{ badge_name: string; badge_icon: string }>(
            'SELECT badge_name, badge_icon FROM user_badges WHERE user_id = ? ',
            [userId]
        );
    },

    async upsertBadge(userId: number, badgeName: string, badgeIcon: string): Promise<void> {
        // Check if user has a badge
        const existing = await db.get(
            'SELECT id FROM user_badges WHERE user_id = ? ',
            [userId]
        );

        if (existing) {
            // User has badge - UPDATE
            await db.run(
                `UPDATE user_badges 
             SET badge_name = ?, badge_icon = ?, earned_at = datetime('now')
             WHERE user_id = ? `,
                [badgeName, badgeIcon, userId]
            );
        } else {
            // User has no badge - INSERT
            await db.run(
                `INSERT INTO user_badges (user_id, badge_name, badge_icon, earned_at)
             VALUES (?, ?, ?, datetime('now'))`,
                [userId, badgeName, badgeIcon]
            );
        }
    },


};

export default gameRepository;
