import { FastifyPluginAsync } from "fastify";
import arenaRepository from "../repository/arenaRepository";

import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { ArenaMeStatsSchema, ArenaMeHistorySchema } from "../../schema/arenaSchema";

const arenaStatsRoutes: FastifyPluginAsync = async (fastifyInstance, opts) : Promise<void> => {
  const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();
  fastify.get(
    "/arena/me/stats",
    { onRequest: [fastify.authenticate]/*, schema: {response: {200 : ArenaMeStatsSchema}}*/ },
    async (req, reply) => {
      const userId = req.user.id;
      const stats = await arenaRepository.getUserStats(userId);
      return reply.status(200).send(stats);
    }
  );

  fastify.get(
    "/arena/me/history",
    { onRequest: [fastify.authenticate]/*, schema: {response: {200 : ArenaMeHistorySchema}} */},
    async (req, reply) => {
      const userId = req.user.id;
      const history = await arenaRepository.getMatchHistoryForUser(userId);
      return reply.status(200).send(history);
    }
  );
};

export default arenaStatsRoutes;