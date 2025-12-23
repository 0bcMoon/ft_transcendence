import { FastifyPluginAsync } from "fastify";
import { Game } from "./models/Game";
import { Tournament } from "./models/Tournament";

const gameRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.get('/users/:userId/stats', { onRequest: [fastify.authenticate] }, Game.getPlayerStatsSummary);
    fastify.get('/users/:userId/elo-progression', { onRequest: [fastify.authenticate] }, Game.getUserEloProgression);


    fastify.get('/users/:id/score-progression', { onRequest: [fastify.authenticate] }, Game.getUserScoreProgression);
    fastify.get("/users/:user_id/games", { onRequest: [fastify.authenticate] }, Game.getUserGames);
    fastify.get("/users/:user_id/match-history", { onRequest: [fastify.authenticate] }, Game.getMatchHistory);

    fastify.get("/games/:gameId/detail", { onRequest: [fastify.authenticate] }, Game.getGameDetail);
    fastify.get("/games/:gameId/players", { onRequest: [fastify.authenticate] }, Game.getGamePlayers);

    fastify.get("/games/recent", { onRequest: [fastify.authenticate] }, Game.getRecentGlobalMatches);
    fastify.get('/games/user/:userId/recent', { onRequest: [fastify.authenticate] }, Game.getRecentMatches);

    fastify.post("/games", { onRequest: [fastify.authenticate] }, Game.createGame);

    fastify.post("/games/start", { onRequest: [fastify.authenticate] }, Game.startGame);
    fastify.post("/games/score", { onRequest: [fastify.authenticate] }, Game.updatePlayerScore);
    fastify.patch("/games/:id/finish", { onRequest: [fastify.authenticate] }, Game.finishGame);
    fastify.post("/games/cancel", { onRequest: [fastify.authenticate] }, Game.cancelGame);

    fastify.get("/games/:id", { onRequest: [fastify.authenticate] }, Game.getGameDetails);

    fastify.get("/games", { onRequest: [fastify.authenticate] }, Game.getGamesByStatus);

    fastify.get('/players/top', { onRequest: [fastify.authenticate] }, Game.getTopPlayers);

    fastify.post('/tournaments', { onRequest: [fastify.authenticate] }, Tournament.createTournament);

    fastify.get('/tournaments', { onRequest: [fastify.authenticate] }, Tournament.listTournaments);

    fastify.get('/tournaments/:id', { onRequest: [fastify.authenticate] }, Tournament.getTournament);

    fastify.post('/tournaments/:id/register', { onRequest: [fastify.authenticate] }, Tournament.registerPlayer);

    fastify.get('/tournaments/:id/players', { onRequest: [fastify.authenticate] }, Tournament.getPlayer);

    fastify.post('/tournaments/:id/start', { onRequest: [fastify.authenticate] }, Tournament.startTournament);
    fastify.get('/tournaments/:id/bracket', { onRequest: [fastify.authenticate] }, Tournament.getBracket);

    fastify.get('/tournaments/:id/games', { onRequest: [fastify.authenticate] }, Tournament.getTournamentGames);
    fastify.get('/tournaments/:id/rounds/:round/games', { onRequest: [fastify.authenticate] }, Tournament.getRoundGames);
    fastify.get('/tournaments/:id/my-match', { onRequest: [fastify.authenticate] }, Tournament.getUserMatch);
    fastify.post('/tournaments/:id/cancel', { onRequest: [fastify.authenticate] }, Tournament.cancelTournament);

};

export default gameRoutes;
