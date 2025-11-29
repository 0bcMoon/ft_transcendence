import { FastifyPluginAsync } from "fastify";
import { handleMessage, removePlayer } from "./game/game.service";

const gameRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get("/game", { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
        const userId = req.user.id;
        fastify.log.info(`Game WebSocket connected: ${userId}`);

        socket.on("message", (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                handleMessage(userId, msg, socket);
            } catch (err) {
                fastify.log.warn(err, `Failed to parse WebSocket message from ${userId}`);
            }
        });

        socket.on("close", () => {
            fastify.log.info(`Player disconnected: ${userId}`);
            removePlayer(userId);
        });

        socket.on("error", (err) => {
            fastify.log.error(err, `WebSocket error for ${userId}`);
            removePlayer(userId);
        });
    });
};

export default gameRoute;
