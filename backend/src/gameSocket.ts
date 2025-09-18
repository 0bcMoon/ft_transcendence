import { matchmaker } from "./game/game";
import { FastifyPluginAsync } from "fastify";

const gameRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get("/game", { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
        const userId = req.user?.id;
        fastify.log.info(`Game WebSocket connected: ${userId}`);

        socket.on("message", (raw) => {
            let msg;
            msg = JSON.parse(raw.toString());
            // fastify.log.info(msg);

            matchmaker.handleMessage(userId, msg, socket);
        });

        socket.on("close", () => {
            fastify.log.info(`Player disconnected: ${userId}`);
            matchmaker.removePlayer(userId);
        });

        socket.on("error", (err) => {
            fastify.log.error(`WebSocket error for ${userId}`, err);
            matchmaker.removePlayer(userId);
        });
    });

};

export default gameRoute;

