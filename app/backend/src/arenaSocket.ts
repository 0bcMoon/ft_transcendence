import type { FastifyPluginAsync } from "fastify";
import { arenaHandleMessage, arenaRemovePlayer } from "./arena/arena.service";

const arenaSocket: FastifyPluginAsync = async (fastify) => {
  fastify.get("/arena", { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
    const userId = req.user.id;
    fastify.log.info(`Arena WS connected: ${userId}`);

    socket.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        await arenaHandleMessage(userId, msg, socket);
      } catch (err) {
        fastify.log.warn(err, `Arena WS parse error for ${userId}`);
      }
    });

    socket.on("close", () => {
      fastify.log.info(`Arena WS disconnected: ${userId}`);
      arenaRemovePlayer(userId);
    });

    socket.on("error", (err) => {
      fastify.log.error(err, `Arena WS error: ${userId}`);
      arenaRemovePlayer(userId);
    });
  });
};

export default arenaSocket;
