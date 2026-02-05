import { FastifyPluginAsync } from "fastify";
import { Arena } from "./models/Arena";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ArenaGameIdCheck } from "../schema/arenaSchema";


const arenaRoutes: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
  const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();
  
  // Match details
  fastify.get("/arena/games/:gameId/players"
    , { onRequest: [fastify.authenticate], schema: {params: ArenaGameIdCheck} }, Arena.getGamePlayers);
  fastify.get("/arena/games/:gameId/detail", { onRequest: [fastify.authenticate] }, Arena.getGameDetail);

  // for history
  fastify.get("/arena/users/:user_id/match-history"
      , { onRequest: [fastify.authenticate], schema: {params: ArenaGameIdCheck} }, Arena.getMatchHistory);

  // Lifecycle
  fastify.patch("/arena/games/:id/finish"
      , { onRequest: [fastify.authenticate], schema: {params: ArenaGameIdCheck} }, Arena.finishGame);

  // list by status
  fastify.get("/arena/games", { onRequest: [fastify.authenticate] }, Arena.getGamesByStatus);

  //Ai:
  fastify.post("/arena/games/ai", { onRequest: [fastify.authenticate] }, Arena.createAIGame);
};

export default arenaRoutes;
