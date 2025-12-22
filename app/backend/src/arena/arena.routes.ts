import type { FastifyPluginAsync } from "fastify";
import { Arena } from "./arena.controller";

const arenaRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/arena/games/recent", { onRequest: [fastify.authenticate] }, Arena.getRecentGlobal);
  fastify.get("/arena/users/:userId/history", { onRequest: [fastify.authenticate] }, Arena.getUserHistory);

  fastify.get("/arena/games/:gameId/detail", { onRequest: [fastify.authenticate] }, Arena.getGameDetail);
  fastify.get("/arena/games/:gameId/players", { onRequest: [fastify.authenticate] }, Arena.getGamePlayers);
};

export default arenaRoutes;
