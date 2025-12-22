import type { FastifyReply, FastifyRequest } from "fastify";
import arenaRepository from "./arena.repository";

export const Arena = {
  getRecentGlobal: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const limit = Number((req.query as any).limit ?? 20);
      const rows = await arenaRepository.getRecentGlobal(limit);

      // frontend-friendly formatting
      const out = rows.map((m: any) => ({
        matchId: m.arena_game_id,
        mode: m.mode,
        date: new Date(m.ended_at || m.created_at).toLocaleDateString(),
        player1_name: m.player1_name ?? "Player 1",
        player1_avatar: m.player1_avatar ?? null,
        player1_score: m.player1_score ?? 0,
        player2_name: m.player2_name ?? (m.player2_id ? "Player 2" : "AI"),
        player2_avatar: m.player2_avatar ?? null,
        player2_score: m.player2_score ?? 0,
        winner_id: m.winner_user_id ?? null,
      }));

      return reply.status(200).send(out);
    } catch (err) {
      return reply.status(500).send({ error: "Failed to fetch arena matches" });
    }
  },

  getUserHistory: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = Number((req.params as any).userId);
      const limit = Number((req.query as any).limit ?? 50);

      if (!userId || Number.isNaN(userId)) {
        return reply.status(400).send({ error: "Invalid userId" });
      }

      const rows = await arenaRepository.getUserHistory(userId, limit);
      return reply.status(200).send(rows);
    } catch (err) {
      return reply.status(500).send({ error: "Failed to fetch arena user history" });
    }
  },

  getGameDetail: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const gameId = Number((req.params as any).gameId);
      if (!gameId || Number.isNaN(gameId)) {
        return reply.status(400).send({ error: "Invalid gameId" });
      }
      const detail = await arenaRepository.getGameDetail(gameId);
      if (!detail) return reply.status(404).send({ error: "Arena game not found" });
      return reply.status(200).send(detail);
    } catch (err) {
      return reply.status(500).send({ error: "Failed to get arena game detail" });
    }
  },

  getGamePlayers: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const gameId = Number((req.params as any).gameId);
      if (!gameId || Number.isNaN(gameId)) {
        return reply.status(400).send({ error: "Invalid gameId" });
      }
      const players = await arenaRepository.getGamePlayers(gameId);
      return reply.status(200).send(players);
    } catch (err) {
      return reply.status(500).send({ error: "Failed to get arena players" });
    }
  },
};
