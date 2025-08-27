import { matchmaker } from "./game/quickmatchmaker";
import { FastifyPluginAsync } from "fastify";

const gameRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get(
        "/game",
        { websocket: true, onRequest: fastify.authenticate },
        (socket, req) => {
            const userId = req.user?.id?.toString();

            if (!userId) {
                fastify.log.warn("WebSocket attempted without authenticated user id");
                socket.close();
                return;
            }

            fastify.log.info(`Game WebSocket connected: ${userId}`);

            let username: string | undefined;
            let identified = false;

            socket.on("message", (raw) => {
                let data;
                try {
                    data = JSON.parse(raw.toString());
                } catch {
                    fastify.log.warn(`Invalid message from ${userId}: ${raw}`);
                    return;
                }

                // First message must be identify
                if (!identified) {
                    if (data.type === "identify" && typeof data.username === "string") {
                        username = data.username;
                        identified = true;

                        //  TypeScript-safe: only call addPlayer if username is confirmed
                        matchmaker.addPlayer(userId, username ?? "Unknown", socket);
                        fastify.log.info(`Player identified: ${userId} as ${username}`);
                    } else {
                        fastify.log.warn(`Unidentified message from ${userId}: ${raw}`);
                        socket.close();
                    }

                    return;
                }

                // Handle game messages after identification
                matchmaker.handleMessage(userId, data);
            });

            const cleanup = () => {
                fastify.log.info(`Cleaning up player: ${userId}`);
                matchmaker.removePlayer(userId);
            };

            socket.on("close", cleanup);
            socket.on("error", (err) => {
                fastify.log.error(`Game WebSocket error: ${userId}`, err);
                cleanup();
            });
        }
    );
};

export default gameRoute;

