import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import Game from "./models/Game"
const gameRoutes: FastifyPluginAsync = async (fastifyInstance): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    // Game CRUD and status
    fastify.post("/game", { onRequest: fastify.authenticate }, Game.createGame);
    fastify.get("/game/:id", { onRequest: fastify.authenticate }, Game.getGameById);
    fastify.get("/game/:id/details", { onRequest: fastify.authenticate }, Game.getGameDetailsWithPlayers);
    fastify.patch("/game/:id/status", { onRequest: fastify.authenticate }, Game.updateGameStatus);
    fastify.post("/game/:id/start", { onRequest: fastify.authenticate }, Game.startMatch);
    fastify.post("/game/:id/finish", { onRequest: fastify.authenticate }, Game.finishGame);
    fastify.post("/game/:id/end", { onRequest: fastify.authenticate }, Game.endMatch);

    // Players
    fastify.post("/game/player", { onRequest: fastify.authenticate }, Game.addPlayerToGame);
    fastify.patch("/game/player/stats", { onRequest: fastify.authenticate }, Game.updatePlayerStats);
    fastify.get("/game/:id/players", { onRequest: fastify.authenticate }, Game.getPlayersInGame);

    // User stats
    fastify.get("/user/stats", { onRequest: fastify.authenticate }, Game.getUserStats);
    fastify.patch("/user/stats", { onRequest: fastify.authenticate }, Game.updateUserStats);

    // Recent games for current user
    fastify.get("/game/recent", { onRequest: fastify.authenticate }, Game.getRecentGamesForUser);
};

export default gameRoutes;
