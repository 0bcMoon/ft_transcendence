import { FastifyRequest, FastifyReply } from "fastify";
import gameRepository from "../repository/gameRepository";

export const Game = {
    getUserScoreProgression: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = Number((req.params as any).id);
            const limit = Number((req.query as any).limit) || 10;
            if (!userId || Number.isNaN(userId))
                return reply.status(400).send({ error: 'Invalid user ID' });

            const data = await gameRepository.getUserScoreProgression(userId, limit);
            return reply.status(200).send(data);
        } catch (err: any) {
            return reply.status(500).send({ error: 'Failed to get score progression', details: err.message });
        }
    },
    getRecentGlobalMatches: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { limit } = req.query as { limit?: string };
            const matchLimit = limit ? Number(limit) : 10;

            const matches = await gameRepository.getRecentGlobalMatches(matchLimit);

            const formattedMatches = matches.map(match => ({
                matchId: match.game_id,
                mode: match.mode,
                date: new Date(match.ended_at || match.created_at).toLocaleDateString(),
                player1_name: match.player1_name,
                player1_avatar: match.player1_avatar,
                player1_score: match.player1_score,
                player2_name: match.player2_name,
                player2_avatar: match.player2_avatar,
                player2_score: match.player2_score,
                winner_id: match.winner_id
            }));

            return reply.status(200).send(formattedMatches);
        } catch (err: any) {
            return reply.status(500).send({
                error: "Failed to fetch recent matches",
                details: err.message
            });
        }
    },

    getUserStats: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = Number((req.params as any).id);

            if (!userId || Number.isNaN(userId)) {
                return reply.status(400).send({ error: 'Invalid user ID' });
            }
            const stats = await gameRepository.getUserStats(userId);

            if (!stats) {
                return reply.status(404).send({ error: 'User not found or no stats available' });
            }

            return reply.status(200).send(stats);
        } catch (err: any) {
            return reply.status(500).send({
                error: 'Failed to get user stats',
                details: err.message
            });
        }
    },

    createGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            // Expecting: { mode, players: [ { user_id: number | null, position: number } ] }
            const { mode, players } = req.body as any;
            const gameId = await gameRepository.createGame(mode);

            for (const player of players) {
                await gameRepository.addPlayerToGame(gameId, player.user_id ?? null, player.position);
            }

            const game = await gameRepository.getGameById(gameId);
            const gamePlayers = await gameRepository.getGamePlayers(gameId);

            return reply.status(201).send({ game, players: gamePlayers });
        } catch (err: any) {
            return reply.status(500).send({ error: "Failed to create game", details: err.message });
        }
    },

    // Start a game
    startGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { game_id } = req.body as any;
            const ok = await gameRepository.startGame(game_id);
            if (!ok) throw new Error("Game not found or not in waiting state");
            const game = await gameRepository.getGameById(game_id);
            return reply.status(200).send({ game });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to start game", details: err.message });
        }
    },

    // Update player score (accepts user_id OR position)
    updatePlayerScore: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { game_id, user_id, position, score } = req.body as any;

            if (typeof game_id !== "number" || typeof score !== "number") {
                return reply.status(400).send({ error: "game_id and score are required" });
            }

            let ok = false;
            if (typeof user_id === "number") {
                ok = await gameRepository.updatePlayerScore(game_id, user_id, score);
            } else if (typeof position === "number") {
                ok = await gameRepository.updatePlayerScoreByPosition(game_id, position, score);
            } else {
                return reply.status(400).send({ error: "Provide user_id or position" });
            }

            if (!ok) throw new Error("Player not found in game");
            return reply.status(200).send({ success: true });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to update score", details: err.message });
        }
    },
    finishGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const game_id = Number((req.params as any).id); // Get game_id from URL param
            const { winner_id } = req.body as any;          // Get winner_id from body
            const ok = await gameRepository.finishGame(game_id, winner_id ?? null);
            if (!ok) throw new Error("Game not found or not in correct state");
            const game = await gameRepository.getGameById(game_id);
            return reply.status(200).send({ game });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to finish game", details: err.message });
        }
    },

    // Cancel a game
    cancelGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { game_id } = req.body as any;
            const ok = await gameRepository.cancelGame(game_id);
            if (!ok) throw new Error("Game not found or not in correct state");
            const game = await gameRepository.getGameById(game_id);
            return reply.status(200).send({ game });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to cancel game", details: err.message });
        }
    },

    // Get a game by id
    getGame: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const game_id = Number((req.params as any).game_id);
            const game = await gameRepository.getGameById(game_id);
            if (!game) throw new Error("Game not found");
            const players = await gameRepository.getGamePlayers(game_id);
            return reply.status(200).send({ game, players });
        } catch (err: any) {
            return reply.status(404).send({ error: "Game not found", details: err.message });
        }
    },
    // getGameDetails: async (req: FastifyRequest, reply: FastifyReply) => {
    //     try {
    //         const game_id = Number((req.params as any).game_id);
    //         const game = await gameRepository.getGameById(game_id);
    //         if (!game) throw new Error("Game not found");
    //         const players = await gameRepository.getGamePlayers(game_id);
    //         return reply.status(200).send({ game, players });
    //     } catch (err: any) {
    //         return reply.status(404).send({ error: "Game not found", details: err.message });
    //     }
    // },

    getGameDetails: async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const gameId = Number(req.params.id);
            if (isNaN(gameId)) {
                return reply.status(400).send({ error: "Invalid game ID format" });
            }
            const data = await gameRepository.getGameWithPlayers(gameId);
            if (!data) {
                return reply.status(404).send({ error: "Game not found" });
            }
            return reply.status(200).send(data);

        } catch (err: any) {
            return reply.status(500).send({ error: "Failed to get game details", details: err.message });
        }
    },

    getUserGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const user_id = Number((req.params as any).user_id);
            const games = await gameRepository.getUserGames(user_id);
            return reply.status(200).send({ games });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get user games", details: err.message });
        }
    },

    // Get games by status & mode
    getGamesByStatus: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { status, mode } = req.query as any;
            const games = await gameRepository.getGamesByStatus(status, mode);
            return reply.status(200).send({ games });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get games", details: err.message });
        }
    },

    getMatchHistory: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { user_id } = req.params as { user_id: string };
            const history = await gameRepository.getMatchHistoryForUser(Number(user_id));
            return reply.status(200).send(history);

        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get match history", details: err.message });
        }
    },
};
