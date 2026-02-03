import { FastifyRequest, FastifyReply } from "fastify";
import arenaRepository from "../repository/arenaRepository";

export const Arena = {
  createGame: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { players } = req.body as any;

      const target_round_wins =
        (req.body as any).target_round_wins ??
        (req.body as any).win_target ??
        5;

      if (!players || !Array.isArray(players) || players.length !== 2) {
        return reply.status(400).send({ error: "players must be an array of 2 players" });
      }

      const gameId = await arenaRepository.createGameAndAddPlayers(players, target_round_wins);
      const detail = await arenaRepository.getGameDetail(gameId);
      const gamePlayers = await arenaRepository.getGamePlayers(gameId);

      return reply.status(201).send({ game: detail, players: gamePlayers });
    } catch (err) {
      return reply.status(500).send({ error: "Failed to create arena game", details: (err as Error).message });
    }
  },

  finishGame: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const gameId = Number((req.params as any).id);

      const winner_user_id =
        (req.body as any).winner_user_id ??
        (req.body as any).winner_id ??
        null;

      if (!gameId || Number.isNaN(gameId)) return reply.status(400).send({ error: "Invalid game ID" });

      await arenaRepository.finish(gameId, winner_user_id);
      const detail = await arenaRepository.getGameDetail(gameId);
      return reply.status(200).send({ game: detail });
    } catch (err) {
      return reply.status(400).send({ error: "Failed to finish arena game", details: (err as Error).message });
    }
  },

  cancelGame: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { game_id } = req.body as any;
      const id = Number(game_id);
      if (!id || Number.isNaN(id)) return reply.status(400).send({ error: "Invalid game ID" });

      await arenaRepository.cancel(id);
      const detail = await arenaRepository.getGameDetail(id);
      return reply.status(200).send({ game: detail });
    } catch (err) {
      return reply.status(400).send({ error: "Failed to cancel arena game", details: (err as Error).message });
    }
  },

  getGameDetail: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const gameId = Number((req.params as any).gameId);
      if (!gameId || Number.isNaN(gameId)) return reply.status(400).send({ error: "Invalid game ID" });

      const detail = await arenaRepository.getGameDetail(gameId);
      if (!detail) return reply.status(404).send({ error: "Arena game not found" });

      return reply.status(200).send(detail);
    } catch (err) {
      return reply.status(500).send({ error: "Failed to get arena game detail", details: (err as Error).message });
    }
  },

  getGamePlayers: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const gameId  = (req.params as any).gameId;
      const players = await arenaRepository.getGamePlayers(gameId);
      return reply.status(200).send(players);
    } catch (err) {
      return reply.status(500).send({ error: "Failed to get arena players", details: (err as Error).message });
    }
  },

  getMatchHistory: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { user_id } = req.params as any;
      const uid = Number(user_id);
      if (!uid || Number.isNaN(uid)) return reply.status(400).send({ error: "Invalid user ID" });
  
      const history = await arenaRepository.getMatchHistoryForUser(uid);
      return reply.status(200).send(history);
    } catch (err) {
      return reply.status(400).send({ error: "Failed to get arena match history", details: (err as Error).message });
    }
  },
  

  getGamesByStatus: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status } = req.query as any;
      if (!status) return reply.status(400).send({ error: "Status is required" });

      const games = await arenaRepository.getGamesByStatus(status);
      return reply.status(200).send({ games });
    } catch (err) {
      return reply.status(400).send({ error: "Failed to get arena games", details: (err as Error).message });
    }
  },

  createAIGame: async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = req.user.id;
  
      const target_round_wins =
        (req.body as any)?.target_round_wins ??
        (req.body as any)?.win_target ??
        5;
  
      const gameId = await arenaRepository.createGameAndAddPlayers(
        [
          { user_id: userId, position: 1 },
          { user_id: null, position: 2, is_ai: true },
        ],
        target_round_wins
      );
  
      await arenaRepository.addEvent(gameId, "created", { via: "ai", p1: userId, aiPos: 2 });
  
      return reply.status(201).send({ gameId });
    } catch (err) {
      return reply.status(500).send({
        error: "Failed to create AI arena game",
        details: (err as Error).message,
      });
    }
  },
};
