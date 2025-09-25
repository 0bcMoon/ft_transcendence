import assert from "assert";
import db from "../../db/db";

/**
 * Database models (mirror your SQL schema)
 */
export interface Game {
    id: number;
    mode: "local_1v1" | "remote_1v1" | "multiplayer" | "tournament";
    status: "waiting" | "in-progress" | "finished";
    max_players: number;
    duration: number;
    created_at: Date;
    ended_at: Date | null;
}

export interface GamePlayer {
    id: number;
    game_id: number;
    user_id: number;
    team: string | null;
    position: string | null; // e.g., 'left' | 'right' for 1v1
    score: number;
    goals_scored: number;
    goals_conceded: number;
    accuracy: number;
}

export interface UserStats {
    user_id: number;
    total_matches: number;
    wins: number;
    losses: number;
    win_rate: number; // percentage (0..100)
    avg_score: number;
    playtime: number; // seconds
    longest_win_streak: number;
    current_win_streak: number;
}

/**
 * Internal helpers
 */
const toDate = (v: unknown): Date => (v instanceof Date ? v : new Date(String(v)));
const toNullableDate = (v: unknown): Date | null => (v ? toDate(v) : null);

const mapGameRow = (row: any): Game => ({
    id: row.id,
    mode: row.mode,
    status: row.status,
    max_players: row.max_players,
    duration: row.duration,
    created_at: toDate(row.created_at),
    ended_at: toNullableDate(row.ended_at),
});

const mapGamePlayerRow = (row: any): GamePlayer => ({
    id: row.id,
    game_id: row.game_id,
    user_id: row.user_id,
    team: row.team,
    position: row.position,
    score: row.score,
    goals_scored: row.goals_scored,
    goals_conceded: row.goals_conceded,
    accuracy: row.accuracy,
});

const mapUserStatsRow = (row: any): UserStats => ({
    user_id: row.user_id,
    total_matches: row.total_matches,
    wins: row.wins,
    losses: row.losses,
    win_rate: row.win_rate,
    avg_score: row.avg_score,
    playtime: row.playtime,
    longest_win_streak: row.longest_win_streak,
    current_win_streak: row.current_win_streak,
});

const assertAtMostOneChange = (changes: number, action: string) => {
    assert(changes <= 1, `Unexpected number of rows ${action}: ${changes}`);
};

type RecentGame = Game & {
    score: number;
    goals_scored: number;
    goals_conceded: number;
};

const mapRecentGameRow = (row: any): RecentGame => ({
    ...mapGameRow(row),
    score: row.score,
    goals_scored: row.goals_scored,
    goals_conceded: row.goals_conceded,
});

/**
 * Repository
 */
export const gameRepository = {
    // -------------------- GAMES --------------------

    createGame: async (
        mode: Game["mode"],
        max_players: number,
        status: Game["status"] = "waiting"
    ): Promise<number> => {
        const query = `INSERT INTO games (mode, max_players, status) VALUES (?, ?, ?)`;
        const result = await db.run(query, [mode, max_players, status]);
        return result.lastID;
    },

    updateGameStatus: async (gameId: number, status: Game["status"]): Promise<boolean> => {
        const query = `UPDATE games SET status = ? WHERE id = ?`;
        const result = await db.run(query, [status, gameId]);
        assertAtMostOneChange(result.changes, "updated");
        return result.changes > 0;
    },

    startMatch: async (gameId: number): Promise<boolean> => {
        return gameRepository.updateGameStatus(gameId, "in-progress");
    },

    finishGame: async (gameId: number, duration: number): Promise<boolean> => {
        const query = `
      UPDATE games
      SET status = 'finished', duration = ?, ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
        const result = await db.run(query, [duration, gameId]);
        assertAtMostOneChange(result.changes, "updated");
        return result.changes > 0;
    },

    endMatch: async (gameId: number, duration: number): Promise<boolean> => {
        return gameRepository.finishGame(gameId, duration);
    },

    getGameById: async (gameId: number): Promise<Game | undefined> => {
        const row = await db.get(`SELECT * FROM games WHERE id = ?`, [gameId]);
        if (!row) return undefined;
        return mapGameRow(row);
    },

    getGameDetailsWithPlayers: async (
        gameId: number
    ): Promise<(Game & { players: GamePlayer[] }) | undefined> => {
        const game = await gameRepository.getGameById(gameId);
        if (!game) return undefined;
        const players = await gameRepository.getPlayersInGame(gameId);
        return { ...game, players };
    },

    getRecentGamesForUser: async (userId: number, limit = 10): Promise<RecentGame[]> => {
        const query = `
      SELECT g.*, gp.score, gp.goals_scored, gp.goals_conceded
      FROM games g
      JOIN game_players gp ON g.id = gp.game_id
      WHERE gp.user_id = ?
      ORDER BY g.created_at DESC
      LIMIT ?
    `;
        const rows = await db.all(query, [userId, limit]);
        return rows.map(mapRecentGameRow);
    },

    deleteGame: async (gameId: number): Promise<boolean> => {
        const query = `DELETE FROM games WHERE id = ?`;
        const result = await db.run(query, [gameId]);
        assertAtMostOneChange(result.changes, "deleted");
        return result.changes > 0;
    },

    // -------------------- GAME PLAYERS --------------------

    addPlayerToGame: async (
        gameId: number,
        userId: number,
        team: string | null = null,
        position: string | null = null
    ): Promise<number> => {
        const query = `INSERT INTO game_players (game_id, user_id, team, position) VALUES (?, ?, ?, ?)`;
        const result = await db.run(query, [gameId, userId, team, position]);
        return result.lastID;
    },

    updatePlayerStats: async (
        gameId: number,
        userId: number,
        score: number,
        goals_scored: number,
        goals_conceded: number,
        accuracy: number
    ): Promise<boolean> => {
        const query = `
      UPDATE game_players
      SET score = ?, goals_scored = ?, goals_conceded = ?, accuracy = ?
      WHERE game_id = ? AND user_id = ?
    `;
        const result = await db.run(query, [
            score,
            goals_scored,
            goals_conceded,
            accuracy,
            gameId,
            userId,
        ]);
        assertAtMostOneChange(result.changes, "updated");
        return result.changes > 0;
    },

    updateScore: async (gameId: number, leftScore: number, rightScore: number): Promise<void> => {
        // Requires positions to be set as 'left' and 'right'
        await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND position = 'left'`,
            [leftScore, gameId]
        );
        await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND position = 'right'`,
            [rightScore, gameId]
        );
    },

    getPlayersInGame: async (gameId: number): Promise<GamePlayer[]> => {
        const rows = await db.all(`SELECT * FROM game_players WHERE game_id = ?`, [gameId]);
        return rows.map(mapGamePlayerRow);
    },

    // -------------------- USER STATS --------------------

    getUserStats: async (userId: number): Promise<UserStats | undefined> => {
        const row = await db.get(`SELECT * FROM user_stats WHERE user_id = ?`, [userId]);
        return row ? mapUserStatsRow(row) : undefined;
    },

    createUserStats: async (userId: number): Promise<number> => {
        const query = `INSERT INTO user_stats (user_id) VALUES (?)`;
        const result = await db.run(query, [userId]);
        return result.lastID;
    },

    updateUserStats: async (userId: number, stats: Partial<UserStats>): Promise<boolean> => {
        // Only allow updating these columns
        const allowed: Array<keyof Omit<UserStats, "user_id">> = [
            "total_matches",
            "wins",
            "losses",
            "win_rate",
            "avg_score",
            "playtime",
            "longest_win_streak",
            "current_win_streak",
        ];

        const entries = Object.entries(stats).filter(([k, v]) => allowed.includes(k as any) && v !== undefined);
        if (entries.length === 0) return false;

        const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
        const values = entries.map(([, v]) => v);

        const query = `UPDATE user_stats SET ${setClause} WHERE user_id = ?`;
        const result = await db.run(query, [...values, userId]);
        assertAtMostOneChange(result.changes, "updated");
        return result.changes > 0;
    },

    updateUserStatsAfterMatch: async (
        userId: number,
        won: boolean,
        score: number,
        duration: number
    ): Promise<void> => {
        const stats = await gameRepository.getUserStats(userId);
        if (!stats) {
            await gameRepository.createUserStats(userId);
            // Re-fetch to ensure defaults
            const fresh = await gameRepository.getUserStats(userId);
            if (!fresh) return; // Should not happen, but be safe
            return gameRepository.updateUserStatsAfterMatch(userId, won, score, duration);
        }

        const total_matches = stats.total_matches + 1;
        const wins = stats.wins + (won ? 1 : 0);
        const losses = stats.losses + (won ? 0 : 1);
        const win_rate = (wins / total_matches) * 100;
        const avg_score = (stats.avg_score * stats.total_matches + score) / total_matches;
        const playtime = stats.playtime + duration;
        const current_win_streak = won ? stats.current_win_streak + 1 : 0;
        const longest_win_streak = Math.max(stats.longest_win_streak, current_win_streak);

        await gameRepository.updateUserStats(userId, {
            total_matches,
            wins,
            losses,
            win_rate,
            avg_score,
            playtime,
            current_win_streak,
            longest_win_streak,
        });
    },
};
