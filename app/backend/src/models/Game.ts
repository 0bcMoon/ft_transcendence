import { FastifyRequest, FastifyReply } from "fastify";
import gameRepository from "../repository/gameRepository";
import { GameDetail } from "../types/game.types";
import { GamePlayerDetail } from "../types/game.types";

export type EloProgressPoint = {
    new_elo: number;
    created_at: string; // ISO date
};


export const Game = {
    getGameDetail: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const gameId = Number((req.params as any).gameId);
            if (!gameId || Number.isNaN(gameId)) {
                return reply.status(400).send({ error: "Invalid game ID" });
            }

            const detail: GameDetail | undefined = await gameRepository.getGameDetail(gameId);
            if (!detail) return reply.status(404).send({ error: "Game not found" });

            return reply.status(200).send(detail);
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: "Failed to get game detail",
                details: error.message,
            });
        }
    },

    getGamePlayers: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const gameId = Number((req.params as any).gameId);
            if (!gameId || Number.isNaN(gameId)) {
                return reply.status(400).send({ error: "Invalid game ID" });
            }

            const players: GamePlayerDetail[] = await gameRepository.getGamePlayers(gameId);
            console.log(`players retrieved: ${JSON.stringify(players)}`);
            return reply.status(200).send(players);

        } catch (err) {
            return reply.status(500).send({
                error: "Failed to get players details",
                details: (err as Error).message,
            });
        }
    },
    getUserEloProgression: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = Number((req.params as any).userId);  // <-- corrected!
            const limit = Number((req.query as any).limit) || 30;

            if (!userId || Number.isNaN(userId)) {
                return reply.status(400).send({ error: 'Invalid user ID' });
            }

            const data: EloProgressPoint[] = await gameRepository.getUserEloProgression(userId, limit);
            console.log(`data retrieved: ${JSON.stringify(data)}`);
            return reply.status(200).send(data);
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: 'Failed to get ELO progression',
                details: error.message
            });
        }
    },
    getPlayerStatsSummary: async (req: FastifyRequest, reply: FastifyReply) => {
        try {

            const userId = Number((req.params as any).userId);
            if (!userId || Number.isNaN(userId)) {
                return reply.status(400).send({ error: "Invalid user ID" });
            }

            const stats = await gameRepository.getPlayerStatsSummary(userId);

            return reply.status(200).send(stats);
        } catch (err) {
            const error = err as Error;
            console.error("Error in getPlayerStatsSummary:", error);
            return reply.status(500).send({
                error: "Failed to get player stats",
                details: error.message,
            });
        }
    },

    getUserScoreProgression: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = Number((req.params as any).id);
            const limit = Number((req.query as any).limit) || 10;

            if (!userId || Number.isNaN(userId)) {
                return reply.status(400).send({ error: 'Invalid user ID' });
            }

            const data = await gameRepository.getUserScoreProgression(userId, limit);
            return reply.status(200).send(data);
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: 'Failed to get score progression',
                details: error.message
            });
        }
    },
    // ✅ NEW: Get recent matches for a specific user
    getRecentMatches: async (req: FastifyRequest, reply: FastifyReply) => {
        console.log("getRecentMatches called");
        try {
            const userId = Number((req.params as any).userId);
            const limit = Number((req.query as any).limit) || 10;
            console.log(`Fetching recent matches for userId: ${userId} with limit: ${limit}`);

            if (!userId || Number.isNaN(userId)) {
                return reply.status(400).send({ error: 'Invalid user ID' });
            }

            console.log("Calling gameRepository.getRecentMatches-------------------------------------");
            const matches = await gameRepository.getRecentMatches(userId, limit);
            console.log(`Retrieved ${matches.length} matches for userId: ${userId}--------------------`);
            return reply.status(200).send(matches);
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: 'Failed to get recent matches',
                details: error.message
            });
        }
    },

    getRecentGlobalMatches: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { limit } = req.query as { limit?: string };
            const matchLimit = limit ? Number(limit) : 10;

            const matches = await gameRepository.getRecentGlobalMatches(matchLimit);

            const formattedMatches = matches.map(match => ({
                matchId: match.game_id,        // ✅ Matches frontend
                mode: match.mode,               // ✅ Matches frontend
                date: new Date(match.ended_at || match.created_at).toLocaleDateString(), // ✅
                player1_name: match.player1_name,    // ✅
                player1_avatar: match.player1_avatar,  // ✅
                player1_score: match.player1_score,   // ✅
                player2_name: match.player2_name,    // ✅
                player2_avatar: match.player2_avatar,  // ✅
                player2_score: match.player2_score,   // ✅
                winner_id: match.winner_id      // ✅
            }));

            return reply.status(200).send(formattedMatches);
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: "Failed to fetch recent matches",
                details: error.message
            });
        }
    },

    createGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { mode, players } = req.body as any;

            if (!mode || !players || !Array.isArray(players)) {
                return reply.status(400).send({ error: 'Invalid request body' });
            }

            const gameId = await gameRepository.createGameAndAddPlayers(mode, players);
            const game = await gameRepository.findById(gameId);
            const gamePlayers = await gameRepository.getPlayers(gameId);

            return reply.status(201).send({ game, players: gamePlayers });
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: "Failed to create game",
                details: error.message
            });
        }
    },

    startGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { game_id } = req.body as any;

            if (!game_id || Number.isNaN(game_id)) {
                return reply.status(400).send({ error: 'Invalid game ID' });
            }

            await gameRepository.start(game_id);
            const game = await gameRepository.findById(game_id);

            return reply.status(200).send({ game });
        } catch (err) {
            const error = err as Error;
            return reply.status(400).send({
                error: "Failed to start game",
                details: error.message
            });
        }
    },

    updatePlayerScore: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { game_id, position, score } = req.body as any;

            if (typeof game_id !== "number" || typeof score !== "number") {
                return reply.status(400).send({ error: "game_id and score are required" });
            }

            if (typeof position !== "number") {
                return reply.status(400).send({ error: "position is required" });
            }

            await gameRepository.updatePlayerScore(game_id, position, score);
            return reply.status(200).send({ success: true });
        } catch (err) {
            const error = err as Error;
            return reply.status(400).send({
                error: "Failed to update score",
                details: error.message
            });
        }
    },

    finishGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const game_id = Number((req.params as any).id);
            const { winner_id } = req.body as any;

            if (!game_id || Number.isNaN(game_id)) {
                return reply.status(400).send({ error: 'Invalid game ID' });
            }

            await gameRepository.finish(game_id, winner_id ?? null);
            const game = await gameRepository.findById(game_id);

            return reply.status(200).send({ game });
        } catch (err) {
            const error = err as Error;
            return reply.status(400).send({
                error: "Failed to finish game",
                details: error.message
            });
        }
    },

    cancelGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { game_id } = req.body as any;

            if (!game_id || Number.isNaN(game_id)) {
                return reply.status(400).send({ error: 'Invalid game ID' });
            }

            await gameRepository.cancel(game_id);
            const game = await gameRepository.findById(game_id);

            return reply.status(200).send({ game });
        } catch (err) {
            const error = err as Error;
            return reply.status(400).send({
                error: "Failed to cancel game",
                details: error.message
            });
        }
    },

    getGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const game_id = Number((req.params as any).game_id);

            if (!game_id || Number.isNaN(game_id)) {
                return reply.status(400).send({ error: 'Invalid game ID' });
            }

            const game = await gameRepository.findById(game_id);

            if (!game) {
                return reply.status(404).send({ error: "Game not found" });
            }

            const players = await gameRepository.getPlayers(game_id);
            return reply.status(200).send({ game, players });
        } catch (err) {
            const error = err as Error;
            return reply.status(404).send({
                error: "Game not found",
                details: error.message
            });
        }
    },

    getGameDetails: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const gameId = Number((req.params as any).id);

            if (isNaN(gameId)) {
                return reply.status(400).send({ error: "Invalid game ID format" });
            }

            const data = await gameRepository.getGameWithPlayers(gameId);

            if (!data) {
                return reply.status(404).send({ error: "Game not found" });
            }

            return reply.status(200).send(data);
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: "Failed to get game details",
                details: error.message
            });
        }
    },

    getUserGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const user_id = Number((req.params as any).user_id);

            if (!user_id || Number.isNaN(user_id)) {
                return reply.status(400).send({ error: 'Invalid user ID' });
            }

            const games = await gameRepository.getUserGames(user_id);
            return reply.status(200).send({ games });
        } catch (err) {
            const error = err as Error;
            return reply.status(400).send({
                error: "Failed to get user games",
                details: error.message
            });
        }
    },

    getGamesByStatus: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, mode } = req.query as any;

            if (!status) {
                return reply.status(400).send({ error: 'Status is required' });
            }

            const games = await gameRepository.getGamesByStatus(status, mode);
            return reply.status(200).send({ games });
        } catch (err) {
            const error = err as Error;
            return reply.status(400).send({
                error: "Failed to get games",
                details: error.message
            });
        }
    },

    getMatchHistory: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { user_id } = req.params as { user_id: string };

            if (!user_id || Number.isNaN(Number(user_id))) {
                return reply.status(400).send({ error: 'Invalid user ID' });
            }

            const history = await gameRepository.getMatchHistoryForUser(Number(user_id));
            return reply.status(200).send(history);
        } catch (err) {
            const error = err as Error;
            return reply.status(400).send({
                error: "Failed to get match history",
                details: error.message
            });
        }
    },

    getTopPlayers: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const limit =
                typeof (req.query as any).limit !== "undefined"
                    ? Number((req.query as any).limit)
                    : 10;
            const players = await gameRepository.getTopPlayers(limit);

            // Optionally, format or filter for frontend needs here

            return reply.status(200).send(players);
        } catch (err) {
            const error = err as Error;
            return reply.status(500).send({
                error: 'Failed to fetch top players',
                details: error.message
            });
        }
    },
};
