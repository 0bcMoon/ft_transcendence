import { matchmaker } from "./game/game.matchmaker";
import { FastifyPluginAsync } from "fastify";

const gameRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get(
        "/game",
        { websocket: true, onRequest: fastify.authenticate },
        (socket, req) => {
            const userId = req.user?.id;
            // const userId = Math.floor(Math.random() * 1000000);

            if (!userId) {
                fastify.log.warn("WebSocket attempted without authenticated user id");
                socket.close();
                return;
            }

            fastify.log.info(`Game WebSocket connected: ${userId}`);
            matchmaker.addPlayer(userId, socket);

            socket.on("message", (msg) => {
                matchmaker.handleMessage(userId, msg.toString());
            });

            socket.on("close", () => {
                fastify.log.info(`Game WebSocket closed: ${userId}`);
                matchmaker.removePlayer(userId);
            });

            socket.on("error", (err) => {
                fastify.log.error(`Game WebSocket error: ${userId}`, err);
                matchmaker.removePlayer(userId);
            });
        },
    );
};

export default gameRoute;
