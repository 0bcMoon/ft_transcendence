// backend/src/arena/matchmaking/arenaMatchmakingRoutes.ts
import { FastifyPluginAsync } from "fastify";
import { arenaMatchmakingService } from "./arenaMatchmaking.service";

const arenaMatchmakingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/arena/matchmaking/join",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      const userId = req.user.id;
      const result = await arenaMatchmakingService.join(userId);
      return reply.status(200).send(result);
    }
  );

  fastify.post(
    "/arena/matchmaking/leave",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      const userId = req.user.id;
      const result = arenaMatchmakingService.leave(userId);
      return reply.status(200).send(result);
    }
  );

  fastify.get(
    "/arena/matchmaking/status",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      const userId = req.user.id;
      const result = arenaMatchmakingService.status(userId);
      return reply.status(200).send(result);
    }
  );
};

export default arenaMatchmakingRoutes;
