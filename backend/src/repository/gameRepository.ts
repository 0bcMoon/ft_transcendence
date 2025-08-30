import assert from "assert";
import db from "../../db/db";

export interface MatchRecord {
    id: number;
    match_uuid: string;
    player_left_id: number;
    player_right_id: number;
    winner_id: number | null;
    left_score: number;
    right_score: number;
    status: "waiting" | "playing" | "ended";
    started_at: Date;
    ended_at: Date | null;
}

export interface GameEventRecord {
    id: number;
    match_id: number;
    event_type: string;
    event_data: string | null;
    created_at: Date;
}

export interface LeaderboardRecord {
    user_id: number;
    games_played: number;
    games_won: number;
    games_lost: number;
    highest_score: number;
    last_played: Date | null;
}

export const gameRepository = {
    // === MATCHES ===
    createMatch: async (
        match_uuid: string,
        player_left_id: number,
        player_right_id: number
    ): Promise<number> => {
        const result = await db.run(
            `INSERT INTO matches (match_uuid, player_left_id, player_right_id, status)
             VALUES (?, ?, ?, 'waiting')`,
            [match_uuid, player_left_id, player_right_id]
        );
        assert(result.changes === 1, "Failed to insert match");
        return result.lastID; // DB row id
    },

    startMatch: async (match_uuid: string) => {
        await db.run(
            `UPDATE matches SET status='playing', started_at=CURRENT_TIMESTAMP
             WHERE match_uuid=?`,
            [match_uuid]
        );
    },

    updateScore: async (
        match_uuid: string,
        left_score: number,
        right_score: number
    ) => {
        await db.run(
            `UPDATE matches SET left_score=?, right_score=? WHERE match_uuid=?`,
            [left_score, right_score, match_uuid]
        );
    },

    endMatch: async (
        match_uuid: string,
        winner_id: number
    ) => {
        await db.run(
            `UPDATE matches
             SET status='ended', winner_id=?, ended_at=CURRENT_TIMESTAMP
             WHERE match_uuid=?`,
            [winner_id, match_uuid]
        );
    },

    getMatchesByUser: async (user_id: number) => {
        return await db.all(
            `SELECT * FROM matches
         WHERE player_left_id = ? OR player_right_id = ?
         ORDER BY started_at DESC`,
            [user_id, user_id]
        );
    },

    getMatchByUUID: async (match_uuid: string): Promise<MatchRecord | undefined> => {
        return await db.get(`SELECT * FROM matches WHERE match_uuid=?`, [match_uuid]);
    },

    // === GAME EVENTS ===
    addEvent: async (
        match_uuid: string,
        event_type: string,
        event_data?: object
    ) => {
        await db.run(
            `INSERT INTO game_events (match_id, event_type, event_data)
             VALUES (
                (SELECT id FROM matches WHERE match_uuid=?),
                ?, ?
             )`,
            [match_uuid, event_type, event_data ? JSON.stringify(event_data) : null]
        );
    },

    getEventsForMatch: async (match_uuid: string): Promise<GameEventRecord[]> => {
        return await db.all(
            `SELECT ge.* FROM game_events ge
             JOIN matches m ON m.id = ge.match_id
             WHERE m.match_uuid=?
             ORDER BY ge.created_at ASC`,
            [match_uuid]
        );
    },

    // === LEADERBOARD ===
    updateLeaderboard: async (
        user_id: number,
        won: boolean,
        score: number
    ) => {
        await db.run(
            `INSERT INTO leaderboard (user_id, games_played, games_won, games_lost, highest_score, last_played)
             VALUES (?, 1, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(user_id) DO UPDATE SET
                games_played = games_played + 1,
                games_won    = games_won + excluded.games_won,
                games_lost   = games_lost + excluded.games_lost,
                highest_score= MAX(highest_score, excluded.highest_score),
                last_played  = CURRENT_TIMESTAMP`,
            [user_id, won ? 1 : 0, won ? 0 : 1, score]
        );
    },

    getTopPlayers: async (limit: number = 10): Promise<LeaderboardRecord[]> => {
        return await db.all(
            `SELECT l.*, u.username, u.display_name
             FROM leaderboard l
             JOIN users u ON u.id = l.user_id
             ORDER BY games_won DESC, games_played DESC
             LIMIT ?`,
            [limit]
        );
    }
};
