import { FastifyRequest, FastifyReply } from "fastify";
import { gameRepository } from "../repository/gameRepository";

const Game = {
    getUserMatches: async (req: FastifyRequest, reply: FastifyReply) => {
        const matches = await gameRepository.getMatchesByUser(req.user.id);
        return reply.status(200).send(matches);
    },

    getMatchDetails: async (req: FastifyRequest, reply: FastifyReply) => {
        const { match_uuid } = req.params as { match_uuid: string };
        const match = await gameRepository.getMatchByUUID(match_uuid);
        if (!match) {
            return reply.status(404).send({ message: "Match not found" });
        }
        const events = await gameRepository.getEventsForMatch(match_uuid);
        return reply.status(200).send({ match, events });
    },

    getLeaderboard: async (req: FastifyRequest, reply: FastifyReply) => {
        const { limit } = req.query as { limit?: number };
        const leaderboard = await gameRepository.getTopPlayers(limit || 10);
        return reply.status(200).send(leaderboard);
    },

    // (Optional) Admin or debug endpoint to create a fake match
    createTestMatch: async (req: FastifyRequest, reply: FastifyReply) => {
        const { left_id, right_id } = req.body as { left_id: number; right_id: number };
        if (left_id === right_id) {
            return reply.status(400).send({ message: "Players must be different" });
        }
        const match_uuid = `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const matchId = await gameRepository.createMatch(match_uuid, left_id, right_id);
        return reply.status(201).send({ match_uuid, db_id: matchId });
    }
};

export default Game;

