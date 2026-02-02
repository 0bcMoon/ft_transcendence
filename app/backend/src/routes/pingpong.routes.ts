import { FastifyPluginAsync } from "fastify";
import { Game } from "../models/Game";
import { Tournament } from "../models/Tournament";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
    createTournamentSchema,
    tournamentIdParamsSchema,
    topPlayersSchema,
    userIdParamsSchema,
    gameIdParamsSchema,
    xpProgressQuerySchema,
    recentMatchesQuerySchema
} from "../schema/tournament.schema";

const PingPongRoutes: FastifyPluginAsync = async (fastifyInstance) => {

    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    fastify.get("/games/:userId/recent", {
        onRequest: [fastify.authenticate],
        schema: {
            params: userIdParamsSchema,
            querystring: recentMatchesQuerySchema,
        }
    }, Game.getMatches);

    fastify.get("/games/recent", {
        onRequest: [fastify.authenticate],
        schema: {
            querystring: recentMatchesQuerySchema,
        }
    }, Game.getGlobalMatches);

    fastify.get('/users/:userId/xp-progress', {
        onRequest: [fastify.authenticate],
        schema: {
            params: userIdParamsSchema,
            querystring: xpProgressQuerySchema,
        }
    }, Game.getUserXPProgression);

    fastify.get("/games/:gameId/detail", {
        onRequest: [fastify.authenticate], schema: {
            params: gameIdParamsSchema
        }
    }, Game.getGameDetail);

    fastify.get('/users/:userId/stats', {
        onRequest: [fastify.authenticate], schema: {
            params: userIdParamsSchema
        }
    }, Game.getPlayerStats);

    fastify.post('/tournaments', {
        onRequest: [fastify.authenticate], schema: {
            body: createTournamentSchema
        }
    }, Tournament.createTournament);

    fastify.get('/tournaments/list', {
        onRequest: [fastify.authenticate]
    }, Tournament.listTournaments);

    fastify.get('/tournaments/:id/champion', {
        onRequest: [fastify.authenticate],
        schema: { params: tournamentIdParamsSchema, },
    }, Tournament.getChampion);


    fastify.post('/tournaments/:id/register', {
        onRequest: [fastify.authenticate],
        schema: { params: tournamentIdParamsSchema }
    }, Tournament.registerPlayer);

    fastify.get('/tournaments/:id/players', {
        onRequest: [fastify.authenticate],
        schema: { params: tournamentIdParamsSchema },
    }, Tournament.listPlayers);

    fastify.get('/players/top', {
        onRequest: [fastify.authenticate],
        schema: { params: topPlayersSchema },
    }, Game.getTopPlayers);

    fastify.get('/tournaments/:id/overview', {
        onRequest: [fastify.authenticate],
        schema: { params: tournamentIdParamsSchema }
    }, Tournament.getTournamentOverview);

    fastify.get('/tournaments/:id/bracket', {
        onRequest: [fastify.authenticate],
        schema: { params: tournamentIdParamsSchema }
    }, Tournament.getBracket);

    fastify.get('/tournaments/:id/name', {
        onRequest: [fastify.authenticate],
        schema: { params: tournamentIdParamsSchema }
    }, Tournament.getTournamentBasic);

    fastify.get("/tournaments/:id/user-match", {
        onRequest: [fastify.authenticate],
        schema: { params: tournamentIdParamsSchema }
    }, Tournament.getUserMatch);
};

export default PingPongRoutes;
