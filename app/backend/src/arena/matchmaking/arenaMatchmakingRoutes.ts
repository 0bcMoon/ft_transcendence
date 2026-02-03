import { FastifyPluginAsync } from "fastify";
import { arenaMatchmakingService } from "./arenaMatchmaking.service";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {LeaveResultSchema, MatchmakingResultSchema} from "../../schema/arenaSchema"


const arenaMatchmakingRoutes: FastifyPluginAsync = async (fastifyInstance, opts) : Promise<void> => {
  const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();
  fastify.post(
    "/arena/matchmaking/join",
    { onRequest: [fastify.authenticate], schema: { response: {200 : MatchmakingResultSchema}} },
    async (req, reply) => {
      const userId = req.user.id;
      const result = await arenaMatchmakingService.join(userId);
      return reply.status(200).send(result);
    }
  );

  fastify.post(
    "/arena/matchmaking/leave",
    { onRequest: [fastify.authenticate], schema: { response: {200 : LeaveResultSchema}} },
    async (req, reply) => {
      const userId = req.user.id;
      const result = arenaMatchmakingService.leave(userId);
      return reply.status(200).send(result);
    }
  );

  fastify.get(
    "/arena/matchmaking/status",
    { onRequest: [fastify.authenticate], schema: { response: {200 : MatchmakingResultSchema}} },
    async (req, reply) => {
      const userId = req.user.id;
      const result = arenaMatchmakingService.status(userId);
      return reply.status(200).send(result);
    }
  );
};

export default arenaMatchmakingRoutes;
