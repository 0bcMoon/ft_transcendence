import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const ModeEnum = z.enum(["local_1v1", "remote_1v1", "multiplayer", "tournament"]);
const StatusEnum = z.enum(["waiting", "in-progress", "finished"]);

const gameRoutes: FastifyPluginAsync = async (fastifyInstance): Promise<void> => {
    const fastify = fastifyInstance.withTypeProvider<ZodTypeProvider>();

    // Create a new game
    fastify.post(
        "/game",
        {
            onRequest: fastify.authenticate,
            schema: {
                body: z.object({
                    mode: ModeEnum,
                    max_players: z.number().int().positive(),
                    status: StatusEnum.optional(),
                }),
            },
        },
        GameController.createGame
    );

    // Get game by id
    fastify.get(
        "/game/:id",
        {
            onRequest: fastify.authenticate,
            schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
        },
        GameController.getGameById
    );

    // Get game details with players
    fastify.get(
        "/game/:id/details",
        {
            onRequest: fastify.authenticate,
            schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
        },
        GameController.getGameDetailsWithPlayers
    );

    // Recent games for current user
    fastify.get(
        "/game/recent",
        {
            onRequest: fastify.authenticate,
            schema: { querystring: z.object({ limit: z.coerce.number().int().positive().max(50).optional() }) },
        },
        GameController.getRecentGamesForUser
    );

    // Update game status
    fastify.patch(
        "/game/:id/status",
        {
            onRequest: fastify.authenticate,
            schema: {
                params: z.object({ id: z.coerce.number().int().positive() }),
                body: z.object({ status: StatusEnum }),
            },
        },
        GameController.updateGameStatus
    );

    // Start a match
    fastify.post(
        "/game/:id/start",
        {
            onRequest: fastify.authenticate,
            schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
        },
        GameController.startMatch
    );

    // Finish a game
    fastify.post(
        "/game/:id/finish",
        {
            onRequest: fastify.authenticate,
            schema: {
                params: z.object({ id: z.coerce.number().int().positive() }),
                body: z.object({ duration: z.coerce.number().nonnegative() }),
            },
        },
        GameController.finishGame
    );

    // End a match (alias)
    fastify.post(
        "/game/:id/end",
        {
            onRequest: fastify.authenticate,
            schema: {
                params: z.object({ id: z.coerce.number().int().positive() }),
                body: z.object({ duration: z.coerce.number().nonnegative() }),
            },
        },
        GameController.endMatch
    );

    // Add a player to game
    fastify.post(
        "/game/player",
        {
            onRequest: fastify.authenticate,
            schema: {
                body: z.object({
                    game_id: z.number().int().positive(),
                    user_id: z.number().int().positive(),
                    team: z.string().min(1).max(64).nullable().optional(),
                    position: z.enum(["left", "right"]).nullable().optional(),
                }),
            },
        },
        GameController.addPlayerToGame
    );

    // Update player stats
    fastify.patch(
        "/game/player/stats",
        {
            onRequest: fastify.authenticate,
            schema: {
                body: z.object({
                    game_id: z.number().int().positive(),
                    user_id: z.number().int().positive(),
                    score: z.number(),
                    goals_scored: z.number(),
                    goals_conceded: z.number(),
                    accuracy: z.number(),
                }),
            },
        },
        GameController.updatePlayerStats
    );

    // Get all players in a game
    fastify.get(
        "/game/:id/players",
        {
            onRequest: fastify.authenticate,
            schema: { params: z.object({ id: z.coerce.number().int().positive() }) },
        },
        GameController.getPlayersInGame
    );

    // Get current user's stats
    fastify.get(
        "/user/stats",
        { onRequest: fastify.authenticate },
        GameController.getUserStats
    );

    // Update current user's stats
    fastify.patch(
        "/user/stats",
        {
            onRequest: fastify.authenticate,
            schema: {
                body: z
                    .object({
                        user_id: z.never().optional(), // prevent overriding user_id
                        total_matches: z.number().int().nonnegative().optional(),
                        wins: z.number().int().nonnegative().optional(),
                        losses: z.number().int().nonnegative().optional(),
                        win_rate: z.number().min(0).max(100).optional(),
                        avg_score: z.number().optional(),
                        playtime: z.number().int().nonnegative().optional(),
                        longest_win_streak: z.number().int().nonnegative().optional(),
                        current_win_streak: z.number().int().nonnegative().optional(),
                    })
                    .strict(),
            },
        },
        GameController.updateUserStats
    );
};

export default gameRoutes;
