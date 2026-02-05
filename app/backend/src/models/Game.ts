import { FastifyRequest, FastifyReply } from "fastify";
import gameRepository from "../repository/gameRepository";
import { MatchDetail } from "../types/game.types";

export const Game = {

    getGameDetail: async (req: FastifyRequest, reply: FastifyReply) => {
        const { gameId } = req.params as { gameId: number };

        const detail: MatchDetail | undefined = await gameRepository.getMatchDetail(gameId);
        if (!detail)
            return reply.status(404).send({ error: "Game not found" });
        return reply.status(200).send(detail);
    },

    getUserXPProgression: async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId } = req.params as { userId: number };
        const { limit } = req.query as { limit: number };

        const progression = await gameRepository.getUserXPProgression(userId, limit);
        return reply.status(200).send(progression);
    },

    getPlayerStats: async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId } = req.params as { userId: number };
        const stats = await gameRepository.getPlayerStats(userId);
        return reply.status(200).send(stats);
    },

    getMatches: async (req: FastifyRequest, reply: FastifyReply) => {
        const { userId } = req.params as { userId: number };
        const { limit, offset } = req.query as { limit: number; offset: number };

        const matches = await gameRepository.getRecentMatches(userId, limit, offset);
        return reply.status(200).send(matches);
    },

    getGlobalMatches: async ( req: FastifyRequest, reply: FastifyReply) => {
        const { limit, offset } = req.query as { limit: number; offset: number };

        const matches = await gameRepository.getRecentGlobalMatches(limit, offset);
        return reply.status(200).send(matches);
    },

    getTopPlayers: async (req: FastifyRequest, reply: FastifyReply) => {
        const { limit } = req.query as { limit: number };
        const players = await gameRepository.getTopPlayers(limit);
        return reply.status(200).send(players);
    },
};

