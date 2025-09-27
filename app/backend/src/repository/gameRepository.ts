import assert from 'assert';
import db from '../../db/db';

export interface Game {
    id: number;
    mode: 'local_1v1' | 'remote_1v1' | 'multiplayer' | 'tournament';
    status: 'waiting' | 'in-progress' | 'finished';
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
    position: string | null;
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
    win_rate: number;
    avg_score: number;
    playtime: number;
    longest_win_streak: number;
    current_win_streak: number;
}

export const gameRepository = {
    // -------------------- GAMES --------------------
    createGame: async (mode: Game['mode'], max_players: number, status: Game['status'] = 'waiting'): Promise<number> => {
        const query = `INSERT INTO games (mode, max_players, status) VALUES (?, ?, ?)`;
        const result = await db.run(query, [mode, max_players, status]);
        return result.lastID;
    },

    updateGameStatus: async (gameId: number, status: Game['status']): Promise<boolean> => {
        const query = `UPDATE games SET status = ? WHERE id = ?`;
        const result = await db.run(query, [status, gameId]);
        assert(result.changes <= 1, 'Unexpected number of rows updated');
        return result.changes > 0;
    },

    startMatch: async (gameId: number): Promise<boolean> => {
        return gameRepository.updateGameStatus(gameId, 'in-progress');
    },

    finishGame: async (gameId: number, duration: number): Promise<boolean> => {
        const query = `
            UPDATE games
            SET status = 'finished', duration = ?, ended_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await db.run(query, [duration, gameId]);
        assert(result.changes <= 1, 'Unexpected number of rows updated');
        return result.changes > 0;
    },

    endMatch: async (gameId: number, duration: number): Promise<boolean> => {
        return gameRepository.finishGame(gameId, duration);
    },

    getGameById: async (gameId: number): Promise<Game | undefined> => {
        return await db.get(`SELECT * FROM games WHERE id = ?`, [gameId]);
    },

    getGameDetailsWithPlayers: async (gameId: number) => {
        const game = await gameRepository.getGameById(gameId);
        if (!game) return undefined;
        const players = await gameRepository.getPlayersInGame(gameId);
        return { ...game, players };
    },

    getRecentGamesForUser: async (userId: number, limit: number = 10) => {
        const query = `
            SELECT g.*, gp.score, gp.goals_scored, gp.goals_conceded
            FROM games g
            JOIN game_players gp ON g.id = gp.game_id
            WHERE gp.user_id = ?
            ORDER BY g.created_at DESC
            LIMIT ?
        `;
        return await db.all(query, [userId, limit]);
    },

    deleteGame: async (gameId: number): Promise<boolean> => {
        const query = `DELETE FROM games WHERE id = ?`;
        const result = await db.run(query, [gameId]);
        assert(result.changes <= 1, 'Unexpected number of rows deleted');
        return result.changes > 0;
    },

    // -------------------- GAME PLAYERS --------------------
    addPlayerToGame: async (gameId: number, userId: number, team: string | null = null, position: string | null = null): Promise<number> => {
        const query = `INSERT INTO game_players (game_id, user_id, team, position) VALUES (?, ?, ?, ?)`;
        const result = await db.run(query, [gameId, userId, team, position]);
        return result.lastID;
    },

    updatePlayerStats: async (gameId: number, userId: number, score: number, goals_scored: number, goals_conceded: number, accuracy: number): Promise<boolean> => {
        const query = `
            UPDATE game_players
            SET score = ?, goals_scored = ?, goals_conceded = ?, accuracy = ?
            WHERE game_id = ? AND user_id = ?
        `;
        const result = await db.run(query, [score, goals_scored, goals_conceded, accuracy, gameId, userId]);
        assert(result.changes <= 1, 'Unexpected number of rows updated');
        return result.changes > 0;
    },

    updateScore: async (gameId: number, leftScore: number, rightScore: number): Promise<void> => {
        await db.run(`UPDATE game_players SET score = ? WHERE game_id = ? AND position = 'left'`, [leftScore, gameId]);
        await db.run(`UPDATE game_players SET score = ? WHERE game_id = ? AND position = 'right'`, [rightScore, gameId]);
    },

    getPlayersInGame: async (gameId: number): Promise<GamePlayer[]> => {
        return await db.all(`SELECT * FROM game_players WHERE game_id = ?`, [gameId]);
    },

    // -------------------- USER STATS --------------------
    getUserStats: async (userId: number): Promise<UserStats | undefined> => {
        return await db.get(`SELECT * FROM user_stats WHERE user_id = ?`, [userId]);
    },

    updateUserStats: async (userId: number, stats: Partial<UserStats>): Promise<boolean> => {
        const fields = Object.keys(stats).map(key => `${key} = ?`).join(', ');
        const values = Object.values(stats);
        const query = `UPDATE user_stats SET ${fields} WHERE user_id = ?`;
        const result = await db.run(query, [...values, userId]);
        assert(result.changes <= 1, 'Unexpected number of rows updated');
        return result.changes > 0;
    },

    updateUserStatsAfterMatch: async (userId: number, won: boolean, score: number, duration: number): Promise<void> => {
        const stats = await gameRepository.getUserStats(userId);
        if (!stats) {
            await gameRepository.createUserStats(userId);
            return gameRepository.updateUserStatsAfterMatch(userId, won, score, duration);
        }
        const total_matches = stats.total_matches + 1;
        const wins = stats.wins + (won ? 1 : 0);
        const losses = stats.losses + (won ? 0 : 1);
        const win_rate = (wins / total_matches) * 100;
        const avg_score = ((stats.avg_score * stats.total_matches) + score) / total_matches;
        const playtime = stats.playtime + duration;
        const current_win_streak = won ? stats.current_win_streak + 1 : 0;
        const longest_win_streak = Math.max(stats.longest_win_streak, current_win_streak);

        await gameRepository.updateUserStats(userId, { total_matches, wins, losses, win_rate, avg_score, playtime, current_win_streak, longest_win_streak });
    },

    createUserStats: async (userId: number): Promise<number> => {
        const query = `INSERT INTO user_stats (user_id) VALUES (?)`;
        const result = await db.run(query, [userId]);
        return result.lastID;
    }
};

