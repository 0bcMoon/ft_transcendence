import { FastifyPluginAsync } from "fastify";
import { Arena } from "./models/Arena";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ArenaGameIdByPlayerSchema } from "../schema/arenaSchema";


const arenaRoutes: FastifyPluginAsync = async (fastifyInstance, opts): Promise<void> => {
  const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();
  
  // Match details
  fastify.get("/arena/games/:gameId/players"
    , { onRequest: [fastify.authenticate], schema: {params: ArenaGameIdByPlayerSchema} }, Arena.getGamePlayers);
  fastify.get("/arena/games/:gameId/detail", { onRequest: [fastify.authenticate] }, Arena.getGameDetail);

  // Recent / history (independent)
  fastify.get("/arena/users/:user_id/match-history"
      , { onRequest: [fastify.authenticate] }, Arena.getMatchHistory);
  fastify.get("/arena/games/user/:userId/recent"
      , { onRequest: [fastify.authenticate], schema: {}}, Arena.getRecentMatches);
  fastify.get("/arena/games/recent"
      , { onRequest: [fastify.authenticate] }, Arena.getRecentGlobalMatches);

  // Lifecycle
  fastify.patch("/arena/games/:id/finish"
      , { onRequest: [fastify.authenticate] }, Arena.finishGame);
  // fastify.post("/arena/games", { onRequest: [fastify.authenticate] }, Arena.createGame);
  fastify.post("/arena/games/start"
      , { onRequest: [fastify.authenticate] }, Arena.startGame);
  fastify.post("/arena/games/cancel"
      , { onRequest: [fastify.authenticate] }, Arena.cancelGame);

  // Optional: list by status
  fastify.get("/arena/games", { onRequest: [fastify.authenticate] }, Arena.getGamesByStatus);

  //Ai:
  fastify.post("/arena/games/ai"
      , { onRequest: [fastify.authenticate] }, Arena.createAIGame);
};

export default arenaRoutes;
