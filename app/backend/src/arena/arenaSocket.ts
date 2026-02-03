import { FastifyPluginAsync } from "fastify";
import { handleArenaMessage, removeArenaPlayer, removeArenaSpectator } from "./arena.server";

const arenaSocket: FastifyPluginAsync = async (fastify) => {
  fastify.get("/arena", { websocket: true, onRequest: fastify.authenticate }, (socket, req) => {
    const userId = req.user.id;

    fastify.log.info(`Arena WS connected: ${userId}`);
    let joinedRole : "watch" | "play" | null = null;


    socket.on("message", async (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        // socket for watch or play
        if (msg.type === 'arena:join')
            joinedRole = msg.spectate ? "watch" : "play";
        
        await handleArenaMessage(userId, msg, socket as any);
      } catch {
        (socket as any).send(JSON.stringify({ type: "arena:error", message: "Invalid message format" }));
      }
    });

    socket.on("close", () => {
      if (joinedRole === "play")
        removeArenaPlayer(userId);
      else if (joinedRole === "watch")
        removeArenaSpectator(userId);
      else {
        removeArenaPlayer(userId);
        removeArenaSpectator(userId);
      }
    });

    socket.on("error", () => {
      if (joinedRole === "play")
        removeArenaPlayer(userId);
      else if (joinedRole === "watch")
        removeArenaSpectator(userId);
      else {
        removeArenaPlayer(userId);
        removeArenaSpectator(userId);
      }
    });
  });
};

export default arenaSocket;
