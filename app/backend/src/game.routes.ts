// routes/game.routes.ts

import { FastifyPluginAsync } from "fastify";
import { Game } from "./models/Game";
import { Tournament } from "./models/Tournament";

const gameRoutes: FastifyPluginAsync = async (fastify) => {

    // ==========================================
    // IMPORTANT: Specific routes BEFORE dynamic /: id routes!
    // ==========================================

    // User stats & progression (BEFORE /users/:user_id/games)
    fastify.get('/users/:userId/stats', {
        onRequest: [fastify.authenticate]
    }, Game.getPlayerStatsSummary);

    fastify.get('/users/:id/score-progression', {
        onRequest: [fastify.authenticate]
    }, Game.getUserScoreProgression);

    // User games & history
    fastify.get("/users/:user_id/games", {
        onRequest: [fastify.authenticate]
    }, Game.getUserGames);

    fastify.get("/users/:user_id/match-history", {
        onRequest: [fastify.authenticate]
    }, Game.getMatchHistory);

    // Recent matches (BEFORE /games/: id)
    fastify.get("/games/recent", { onRequest: [fastify.authenticate] }, Game.getRecentGlobalMatches);
    fastify.get('/games/user/:userId/recent', { onRequest: [fastify.authenticate] }, Game.getRecentMatches);

    // Game CRUD
    fastify.post("/games", {
        onRequest: [fastify.authenticate]
    }, Game.createGame);

    fastify.post("/games/start", {
        onRequest: [fastify.authenticate]
    }, Game.startGame);

    fastify.post("/games/score", {
        onRequest: [fastify.authenticate]
    }, Game.updatePlayerScore);

    fastify.patch("/games/:id/finish", {
        onRequest: [fastify.authenticate]
    }, Game.finishGame);

    fastify.post("/games/cancel", {
        onRequest: [fastify.authenticate]
    }, Game.cancelGame);

    // Game queries (AFTER specific routes)
    fastify.get("/games/:id", {
        onRequest: [fastify.authenticate]
    }, Game.getGameDetails);

    fastify.get("/games", {
        onRequest: [fastify.authenticate]
    }, Game.getGamesByStatus);

    fastify.get('/players/top', { onRequest: [fastify.authenticate] }, Game.getTopPlayers);

    // ==========================================
    // TOURNAMENT ROUTES
    // ==========================================


    // Create tournament
    fastify.post('/tournaments', {
        onRequest: [fastify.authenticate]
    }, Tournament.createTournament);

    // List all tournaments
    fastify.get('/tournaments', {
        onRequest: [fastify.authenticate]
    }, Tournament.listTournaments);

    // Get tournament details
    fastify.get('/tournaments/:id', {
        onRequest: [fastify.authenticate]
    }, Tournament.getTournament);

    // Register for tournament
    fastify.post('/tournaments/:id/register', {
        onRequest: [fastify.authenticate]
    }, Tournament.registerPlayer);

    // List tournament players
    fastify.get('/tournaments/:id/players', {
        onRequest: [fastify.authenticate]
    }, Tournament.listPlayers);

    // Start tournament
    fastify.post('/tournaments/:id/start', {
        onRequest: [fastify.authenticate]
    }, Tournament.startTournament);

    // Get tournament bracket
    fastify.get('/tournaments/:id/bracket', {
        onRequest: [fastify.authenticate]
    }, Tournament.getBracket);

    // Get all tournament games
    fastify.get('/tournaments/:id/games', {
        onRequest: [fastify.authenticate]
    }, Tournament.getTournamentGames);

    // Get round games
    fastify.get('/tournaments/:id/rounds/:round/games', {
        onRequest: [fastify.authenticate]
    }, Tournament.getRoundGames);

    // ✅ Get user's current match
    fastify.get('/tournaments/:id/my-match', {
        onRequest: [fastify.authenticate]
    }, Tournament.getUserMatch);

    // Cancel tournament
    fastify.post('/tournaments/:id/cancel', {
        onRequest: [fastify.authenticate]
    }, Tournament.cancelTournament);


};

export default gameRoutes;
