import { FastifyRequest, FastifyReply } from "fastify";
import { gameRepository, UserStats, Game } from "../repository/gameRepository";

interface CreateGameBody {
    mode: Game['mode'];
    max_players: number;
}

interface AddPlayerBody {
    game_id: number;
    user_id: number;
    team?: string | null;
    position?: string | null;
}

interface UpdatePlayerStatsBody {
    game_id: number;
    user_id: number;
    score: number;
    goals_scored: number;
    goals_conceded: number;
    accuracy: number;
}

export const GameController = {
    // Create a new game
    async createGame(req: FastifyRequest, reply: FastifyReply) {
        const { mode, max_players } = req.body as CreateGameBody;
        const gameId = await gameRepository.createGame(mode, max_players);
        return reply.status(201).send({ game_id: gameId, message: "Game created successfully" });
    },

    // Get a game by ID
    async getGameById(req: FastifyRequest, reply: FastifyReply) {
        const { id } = req.params as { id: number };
        const game = await gameRepository.getGameById(id);
        if (!game) return reply.status(404).send({ message: "Game not found" });
        return reply.status(200).send(game);
    },

    // Get recent games for the current user
    async getRecentGamesForUser(req: FastifyRequest, reply: FastifyReply) {
        const games = await gameRepository.getRecentGamesForUser(req.user.id, 10);
        return reply.status(200).send(games);
    },

    // Update game status
    async updateGameStatus(req: FastifyRequest, reply: FastifyReply) {
        const { id } = req.params as { id: number };
        const { status } = req.body as { status: Game['status'] };
        const updated = await gameRepository.updateGameStatus(id, status);
        if (!updated) return reply.status(404).send({ message: "Game not found or status unchanged" });
        return reply.status(200).send({ message: "Game status updated" });
    },

    // Finish a game (no winner_id in schema)
    async finishGame(req: FastifyRequest, reply: FastifyReply) {
        const { id } = req.params as { id: number };
        const { duration } = req.body as { duration: number };
        const updated = await gameRepository.finishGame(id, duration);
        if (!updated) return reply.status(404).send({ message: "Game not found or could not be finished" });
        return reply.status(200).send({ message: "Game finished successfully" });
    },

    // Add a player to a game
    async addPlayerToGame(req: FastifyRequest, reply: FastifyReply) {
        const { game_id, user_id, team, position } = req.body as AddPlayerBody;
        const playerId = await gameRepository.addPlayerToGame(game_id, user_id, team || null, position || null);
        return reply.status(201).send({ player_id: playerId, message: "Player added to game" });
    },

    // Update player stats in a game
    async updatePlayerStats(req: FastifyRequest, reply: FastifyReply) {
        const { game_id, user_id, score, goals_scored, goals_conceded, accuracy } = req.body as UpdatePlayerStatsBody;
        const updated = await gameRepository.updatePlayerStats(game_id, user_id, score, goals_scored, goals_conceded, accuracy);
        if (!updated) return reply.status(404).send({ message: "Player not found in game" });
        return reply.status(200).send({ message: "Player stats updated" });
    },

    // Get all players in a game
    async getPlayersInGame(req: FastifyRequest, reply: FastifyReply) {
        const { id } = req.params as { id: number };
        const players = await gameRepository.getPlayersInGame(id);
        return reply.status(200).send(players);
    },

    // Get user stats
    async getUserStats(req: FastifyRequest, reply: FastifyReply) {
        const stats = await gameRepository.getUserStats(req.user.id);
        if (!stats) return reply.status(404).send({ message: "Stats not found" });
        return reply.status(200).send(stats);
    },

    // Update user stats
    async updateUserStats(req: FastifyRequest, reply: FastifyReply) {
        const body = req.body as Partial<UserStats>;
        const updated = await gameRepository.updateUserStats(req.user.id, body);
        if (!updated) return reply.status(404).send({ message: "Stats not found or unchanged" });
        return reply.status(200).send({ message: "User stats updated" });
    }
};

export default GameController;

