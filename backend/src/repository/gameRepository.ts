import db from "../../db/db";

import { Game, GamePlayer, GameMode, GameStatus, } from '../types/gameTypes';


const gameRepository = {
    // Create a new game, returns its id
    async createGame(mode: GameMode): Promise<number> {
        const result = await db.run(`INSERT INTO games (mode, status) VALUES (?, 'waiting')`, [mode]);
        return result.lastID as number;
    },

    // Get a game by id
    async getGameById(id: number): Promise<Game | undefined> {
        return await db.get(`SELECT * FROM games WHERE id = ?`, [id]);
    },

    // Add a player to a game (user_id can be null for AI)
    async addPlayerToGame(game_id: number, user_id: number | null, position: number): Promise<number> {
        const result = await db.run(
            `INSERT INTO game_players (game_id, user_id, position) VALUES (?, ?, ?)`,
            [game_id, user_id, position]
        );
        return result.lastID as number;
    },

    // Update a player's score in a game
    async updatePlayerScore(game_id: number, user_id: number, score: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND user_id = ?`,
            [score, game_id, user_id]
        );
        return result.changes > 0;
    },

    // Update a player's score in a game by position (1 = left, 2 = right)
    async updatePlayerScoreByPosition(game_id: number, position: number, score: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE game_players SET score = ? WHERE game_id = ? AND position = ?`,
            [score, game_id, position]
        );
        return result.changes > 0;
    },

    // Get all players for a game
    async getGamePlayers(game_id: number): Promise<GamePlayer[]> {
        return await db.all(
            `SELECT * FROM game_players WHERE game_id = ? ORDER BY position ASC`,
            [game_id]
        );
    },

    // Start a game (set status to 'playing' and started_at)
    async startGame(game_id: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE games SET status = 'playing', started_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'waiting'`,
            [game_id]
        );
        return result.changes > 0;
    },

    // Finish a game (set status to 'finished', winner_id, ended_at)
    async finishGame(game_id: number, winner_id: number | null): Promise<boolean> {
        console.log('winer is == ', winner_id);
        console.log('game is === ', game_id);
        const result = await db.run(
            `UPDATE games SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [winner_id, game_id]
        );
        return result.changes > 0;
    },

    // Cancel a game
    async cancelGame(game_id: number): Promise<boolean> {
        const result = await db.run(
            `UPDATE games SET status = 'cancelled', ended_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('waiting', 'playing')`,
            [game_id]
        );
        return result.changes > 0;
    },

    // Get games by status (optionally filter by mode)
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

    // Get all games a user played in
    async getUserGames(user_id: number): Promise<Game[]> {
        return await db.all(
            `SELECT g.* FROM games g JOIN game_players gp ON gp.game_id = g.id
       WHERE gp.user_id = ? ORDER BY g.created_at DESC`,
            [user_id]
        );
    }
};
export default gameRepository;
