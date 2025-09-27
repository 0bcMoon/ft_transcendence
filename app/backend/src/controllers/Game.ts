// src/controllers/Game.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { gameRepository } from "../repository/gameRepository";

interface CreateMatchBody {
    opponentType: "ai" | "human";
    aiName?: string;
}

interface ControlBody {
    up: boolean;
    down: boolean;
}

interface MatchParams {
    id: string; // match_uuid
}

const Game = {
    createMatch: async (req: FastifyRequest<{ Body: CreateMatchBody }>, reply: FastifyReply) => {
        const { opponentType, aiName } = req.body;
        const match_uuid = `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const left_id = req.user.id;
        let right_id: number | null = null;

        if (opponentType === "ai") {
            // Could store aiName in events or metadata
        }

        const matchId = await gameRepository.createMatch(match_uuid, left_id, right_id ?? left_id);
        return reply.status(201).send({ match_uuid, db_id: matchId });
    },

    joinMatch: async (req: FastifyRequest<{ Params: MatchParams }>, reply: FastifyReply) => {
        const { id } = req.params;
        // TODO: Update match to add right player
        return reply.send({ success: true });
    },

    getState: async (req: FastifyRequest<{ Params: MatchParams }>, reply: FastifyReply) => {
        const { id } = req.params;
        // TODO: Fetch from in-memory matchmaker or DB snapshot
        return reply.send({ state: {/* paddles, ball, score */ } });
    },

    sendControl: async (req: FastifyRequest<{ Params: MatchParams; Body: ControlBody }>, reply: FastifyReply) => {
        const { id } = req.params;
        const { up, down } = req.body;
        // TODO: Forward to matchmaker WS loop
        return reply.send({ success: true });
    },

    leaveMatch: async (req: FastifyRequest<{ Params: MatchParams }>, reply: FastifyReply) => {
        const { id } = req.params;
        // TODO: Remove player from match
        return reply.send({ success: true });
    },

    getUserMatches: async (req: FastifyRequest, reply: FastifyReply) => {
        const matches = await gameRepository.getMatchesByUser(req.user.id);
        return reply.send(matches);
    },

    getMatchDetails: async (req: FastifyRequest<{ Params: MatchParams }>, reply: FastifyReply) => {
        const { id } = req.params;
        const match = await gameRepository.getMatchByUUID(id);
        if (!match) return reply.status(404).send({ message: "Match not found" });
        const events = await gameRepository.getEventsForMatch(id);
        return reply.send({ match, events });
    },

    getLeaderboard: async (req: FastifyRequest, reply: FastifyReply) => {
        const { limit } = req.query as { limit?: number };
        const leaderboard = await gameRepository.getTopPlayers(limit || 10);
        return reply.send(leaderboard);
    },

    getUserStats: async (req: FastifyRequest, reply: FastifyReply) => {
        const userId = req.user.id;
        const leaderboard = await gameRepository.getTopPlayers(1000);
        const rankIndex = leaderboard.findIndex(p => p.user_id === userId);
        const ranking = rankIndex >= 0 ? rankIndex + 1 : null;
        const matches = await gameRepository.getMatchesByUser(userId);
        const wins = matches.filter(m => m.winner_id === userId).length;
        const playtimeHours = matches.reduce((total, m) => {
            if (m.started_at && m.ended_at) {
                const start = new Date(m.started_at).getTime();
                const end = new Date(m.ended_at).getTime();
                return total + (end - start) / (1000 * 60 * 60);
            }
            return total;
        }, 0);
        return reply.send({ ranking, wins, playtime: Math.round(playtimeHours) });
    }
};

export default Game;

