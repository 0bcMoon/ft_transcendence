// src/routes/gameRoutes.ts
import { FastifyPluginAsync } from "fastify";
import Game from "./models/Game";

const gameRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
    // Create a new match (vs AI or human)
    fastify.post(
        "/game/matches",
        { onRequest: fastify.authenticate },
        Game.createMatch
    );

    // Join an existing match
    fastify.post("/game/matches/:id/join", { onRequest: fastify.authenticate }, Game.joinMatch);

    // Get current game state snapshot
    fastify.get(
        "/game/matches/:id/state",
        { onRequest: fastify.authenticate },
        Game.getState
    );

    // Send paddle control input
    fastify.post(
        "/game/matches/:id/control",
        { onRequest: fastify.authenticate },
        Game.sendControl
    );

    // Leave a match
    fastify.post(
        "/game/matches/:id/leave",
        { onRequest: fastify.authenticate },
        Game.leaveMatch
    );

    // Get matches for current user
    fastify.get(
        "/game/matches",
        { onRequest: fastify.authenticate },
        Game.getUserMatches
    );

    // Get match details + events
    fastify.get(
        "/game/matches/:id",
        { onRequest: fastify.authenticate },
        Game.getMatchDetails
    );

    // Get leaderboard
    fastify.get(
        "/game/leaderboard",
        { onRequest: fastify.authenticate },
        Game.getLeaderboard
    );

    // Get current user's stats
    fastify.get(
        "/game/stats",
        { onRequest: fastify.authenticate },
        Game.getUserStats
    );
};

export default gameRoutes;

