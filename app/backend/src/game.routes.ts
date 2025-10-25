import { FastifyPluginAsync } from "fastify";
import { Game } from "./models/Game";
import { Tournament } from "./models/Tournament";

const gameRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post("/games", { onRequest: [fastify.authenticate] }, Game.createGame);
    fastify.post("/games/start", { onRequest: [fastify.authenticate] }, Game.startGame);
    fastify.post("/games/score", { onRequest: [fastify.authenticate] }, Game.updatePlayerScore);
    fastify.patch("/games/:id/finish", { onRequest: [fastify.authenticate] }, Game.finishGame);
    fastify.post("/games/cancel", { onRequest: [fastify.authenticate] }, Game.cancelGame);
    fastify.get("/games/:game_id", { onRequest: [fastify.authenticate] }, Game.getGame);
    fastify.get("/users/:user_id/games", { onRequest: [fastify.authenticate] }, Game.getUserGames);
    fastify.get("/games", { onRequest: [fastify.authenticate] }, Game.getGamesByStatus);

    fastify.post("/tournaments", { onRequest: [fastify.authenticate] }, Tournament.createTournament);
    fastify.get("/tournaments/:id", { onRequest: [fastify.authenticate] }, Tournament.getTournament);
    fastify.get("/tournaments", { onRequest: [fastify.authenticate] }, Tournament.listTournaments);
    fastify.post("/tournaments/:id/register", { onRequest: [fastify.authenticate] }, Tournament.registerPlayer);
    fastify.get("/tournaments/:id/players", { onRequest: [fastify.authenticate] }, Tournament.listPlayers);
    fastify.post("/tournaments/:id/start", { onRequest: [fastify.authenticate] }, Tournament.start);
    fastify.post("/tournaments/:id/advance", { onRequest: [fastify.authenticate] }, Tournament.advanceRound);
    fastify.get("/tournaments/:id/games", { onRequest: [fastify.authenticate] }, Tournament.getTournamentGames);
    fastify.get("/tournaments/:id/rounds/:round/games", { onRequest: [fastify.authenticate] }, Tournament.getRoundGames);
    fastify.get("/tournaments/:id/bracket", { onRequest: [fastify.authenticate] }, Tournament.getBracket);
    fastify.post("/tournaments/:id/cancel", { onRequest: [fastify.authenticate] }, Tournament.cancelTournament);

};

export default gameRoutes;
