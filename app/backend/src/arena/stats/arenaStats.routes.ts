import { FastifyPluginAsync } from "fastify";
import arenaRepository from "../repository/arenaRepository";

const arenaStatsRoutes: FastifyPluginAsync = async (fastify) => {
  // Stats for the currently authenticated user
  fastify.get(
    "/arena/me/stats",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      const userId = req.user.id;
      const stats = await arenaRepository.getUserStats(userId);
      return reply.status(200).send(stats);
    }
  );

  // Match history for the currently authenticated user
  fastify.get(
    "/arena/me/history",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      const userId = req.user.id;
      const history = await arenaRepository.getMatchHistoryForUser(userId);
      return reply.status(200).send(history);
    }
  );

  // Recent matches for currently authenticated user (optional helper)
  // fastify.get(
  //   "/arena/me/recent",
  //   { onRequest: [fastify.authenticate] },
  //   async (req, reply) => {
  //     const userId = req.user.id;
  //     const limit = Number((req.query as any).limit) || 10;
  //     const recent = await arenaRepository.getRecentMatches(userId, limit);
  //     return reply.status(200).send(recent);
  //   }
  // );
};

export default arenaStatsRoutes;