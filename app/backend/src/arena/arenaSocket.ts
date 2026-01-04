import { FastifyPluginAsync } from "fastify";
import { handleArenaMessage, removeArenaPlayer, removeArenaSpectator } from "./arena.server";

const arenaSocket: FastifyPluginAsync = async (fastify) => {
  fastify.get("/arena", { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
    const userId = req.user.id;

    fastify.log.info(`Arena WS connected: ${userId}`);

    socket.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        await handleArenaMessage(userId, msg, socket as any);
      } catch {
        (socket as any).send(JSON.stringify({ type: "arena:error", message: "Invalid message format" }));
      }
    });

    socket.on("close", () => {
      removeArenaPlayer(userId);
      removeArenaSpectator(userId); // ✅ NEW
    });

    socket.on("error", () => {
      removeArenaPlayer(userId);
      removeArenaSpectator(userId); // ✅ NEW
    });
  });
};

export default arenaSocket;
