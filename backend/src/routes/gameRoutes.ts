// src/routes/gameRoutes.ts
import { FastifyPluginAsync } from "fastify";
import Game from "../controllers/Game";


interface MatchParams { id: string }
interface ControlBody { up: boolean; down: boolean }

const gameRoutes: FastifyPluginAsync = async (fastify) => {
    // fastify.post("/game/matches", { onRequest: fastify.authenticate }, Game.createMatch);
    fastify.post<{ Params: MatchParams }>("/game/matches/:id/join", { onRequest: fastify.authenticate }, Game.joinMatch);
    fastify.get<{ Params: MatchParams }>("/game/matches/:id/state", { onRequest: fastify.authenticate }, Game.getState);
    fastify.post<{ Params: MatchParams; Body: ControlBody }>("/game/matches/:id/control", { onRequest: fastify.authenticate }, Game.sendControl);
    fastify.post<{ Params: MatchParams }>("/game/matches/:id/leave", { onRequest: fastify.authenticate }, Game.leaveMatch);
    fastify.get("/game/matches", { onRequest: fastify.authenticate }, Game.getUserMatches);
    fastify.get<{ Params: MatchParams }>("/game/matches/:id", { onRequest: fastify.authenticate }, Game.getMatchDetails);
    fastify.get("/game/leaderboard", { onRequest: fastify.authenticate }, Game.getLeaderboard);
    fastify.get("/game/stats", { onRequest: fastify.authenticate }, Game.getUserStats);
};

export default gameRoutes;

