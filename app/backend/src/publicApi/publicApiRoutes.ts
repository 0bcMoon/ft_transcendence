import { FastifyPluginAsync } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import env from "../env";
import { publicApiAuth, publicApiAdminOnly } from "./publicApiAuth";
import { registerPublicApiDocs } from "./publicApiDocs";
import arenaRepository from "../arena/repository/arenaRepository";

const ApiError = z.object({
  message: z.string(),
});


export const PublicArenaGame = z.object({
  id: z.number().int(),
  status: z.string(),
  winner_user_id: z.number().int().nullable(),
  target_round_wins: z.number().int(),
  created_at: z.any(),
  started_at: z.any().nullable(),
  ended_at: z.any().nullable(),
});

const PublicArenaPlayer = z.object({
  position: z.number().int(),
  user_id: z.number().int().nullable(),
  username: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  profile_picture: z.string().nullable().optional(),
  round_wins: z.number().int(),
  is_ai: z.boolean(),
});

const CreatePublicGameBody = z.object({
  players: z.array(
    z.object({
      user_id: z.number().int().nullable(),
      position: z.union([z.literal(1), z.literal(2)]),
      is_ai: z.boolean().optional(),
    })
  ).length(2),
  target_round_wins: z.number().int().min(1).max(50).optional(),
});

const UpdatePublicGameBody = z.object({
  action: z.enum(["finish", "cancel"]),
  winner_user_id: z.number().int().nullable().optional(),
});

const publicApiRoutes: FastifyPluginAsync = async (fastify) => {
  await registerPublicApiDocs(fastify);

  await fastify.register(rateLimit, {
    max: env.PUBLIC_API_RATE_LIMIT_MAX,
    timeWindow: env.PUBLIC_API_RATE_LIMIT_WINDOW,
    keyGenerator: (req) => {
      const key = (req.headers["x-api-key"] as string | undefined) ?? "";
      return key ? `key:${key}` : `ip:${req.ip}`;
    },
    errorResponseBuilder: (_req, context) => ({
      message: "Rate limit exceeded",
    }),
  });

  fastify.addHook("preHandler", publicApiAuth);

  // ---------------------------
  // GET /api/public/arena/games?status=finished
  // ---------------------------
  fastify.get(
  "/arena/games",
  {
    schema: {
      tags: ["Public Arena"],
      querystring: z.object({ status: z.string().optional() }),
      response: {
        200: z.object({ games: z.array(PublicArenaGame) }),
        400: ApiError,
        401: ApiError,
        429: ApiError,
      },
    },
  },
  async (req, reply) => {
    const { status } = req.query as any;
    if (!status) {
      reply.status(400).send({ message: "status is required" });
      return;
    }
    const games = await arenaRepository.getGamesByStatus(status);
    return reply.status(200).send({ games });
  }
);


  // ---------------------------
  // GET /api/public/arena/games/:gameId
  // ---------------------------
  fastify.get(
    "/arena/games/:gameId",
    {
      schema: {
        tags: ["Public Arena"],
        params: z.object({ gameId: z.coerce.number().int() }),
        response: {
          200: PublicArenaGame,
          401: ApiError,
          404: ApiError,
          400: ApiError,
          429: ApiError,
        },
      },
    },
    async (req, reply) => {
      const gameId = Number((req.params as any).gameId);
      if (!gameId || Number.isNaN(gameId)) {
        reply.status(400).send({ message: "Invalid gameId" });
        return;
      }
      const detail = await arenaRepository.getGameDetail(gameId);
      if (!detail) {
        reply.status(404).send({ message: "Arena game not found" });
        return;
      }
      return reply.status(200).send(detail);
    }
  );

  // ---------------------------
  // GET /api/public/arena/games/:gameId/players
  // ---------------------------
  fastify.get(
    "/arena/games/:gameId/players",
    {
      schema: {
        tags: ["Public Arena"],
        params: z.object({ gameId: z.coerce.number().int() }),
        response: {
          200: z.array(PublicArenaPlayer),
          401: ApiError,
          400: ApiError,
          429: ApiError,
        },
      },
    },
    async (req, reply) => {
      const gameId = Number((req.params as any).gameId);
      if (!gameId || Number.isNaN(gameId)) {
        reply.status(400).send({ message: "Invalid gameId" });
        return;
      }

      const players = await arenaRepository.getGamePlayers(gameId);

      // Optional: strip fields you don’t want public
      const safe = players.map((p) => ({
        position: p.position,
        user_id: p.user_id,
        username: p.username ?? null,
        display_name: p.display_name ?? null,
        profile_picture: p.profile_picture ?? null,
        round_wins: p.round_wins ?? 0,
        is_ai: !!p.is_ai,
      }));

      return reply.status(200).send(safe);
    }
  );

  // ---------------------------
  // POST /api/public/arena/games  (ADMIN)
  // Create a game with 2 players
  // ---------------------------
  fastify.post(
    "/arena/games",
    {
      preHandler: publicApiAdminOnly,
      schema: {
        tags: ["Public Arena"],
        body: CreatePublicGameBody,
        response: {
          201: z.object({
            game: PublicArenaGame,
            players: z.array(PublicArenaPlayer),
          }),
          401: ApiError,
          403: ApiError,
          400: ApiError,
          429: ApiError,
          500: ApiError,
        },
      },
    },
    async (req, reply) => {
      const body = req.body as any;

      const target = body.target_round_wins ?? 5;

      const gameId = await arenaRepository.createGameAndAddPlayers(body.players, target);
      const detail = await arenaRepository.getGameDetail(gameId);
      const players = await arenaRepository.getGamePlayers(gameId);

      if (!detail) {
        reply.status(500).send({ message: "Failed to load created game" });
        return;
      }

      const safePlayers = players.map((p) => ({
        position: p.position,
        user_id: p.user_id,
        username: p.username ?? null,
        display_name: p.display_name ?? null,
        profile_picture: p.profile_picture ?? null,
        round_wins: p.round_wins ?? 0,
        is_ai: !!p.is_ai,
      }));

      return reply.status(201).send({ game: detail, players: safePlayers });
    }
  );

  // ---------------------------
  // PUT /api/public/arena/games/:gameId  (ADMIN)
  // finish or cancel via one endpoint
  // ---------------------------
  fastify.put(
    "/arena/games/:gameId",
    {
      preHandler: publicApiAdminOnly,
      schema: {
        tags: ["Public Arena"],
        params: z.object({ gameId: z.coerce.number().int() }),
        body: UpdatePublicGameBody,
        response: {
          200: PublicArenaGame,
          401: ApiError,
          403: ApiError,
          404: ApiError,
          400: ApiError,
          429: ApiError,
        },
      },
    },
    async (req, reply) => {
      const gameId = Number((req.params as any).gameId);
      if (!gameId || Number.isNaN(gameId)) {
        reply.status(400).send({ message: "Invalid gameId" });
        return;
      }

      const body = req.body as any;

      const existing = await arenaRepository.getGameDetail(gameId);
      if (!existing) {
        reply.status(404).send({ message: "Arena game not found" });
        return;
      }

      if (body.action === "finish") {
        await arenaRepository.finish(gameId, body.winner_user_id ?? null);
      } else if (body.action === "cancel") {
        await arenaRepository.cancel(gameId);
      }

      const updated = await arenaRepository.getGameDetail(gameId);
      if (!updated) {
        reply.status(404).send({ message: "Arena game not found" });
        return;
      }

      return reply.status(200).send(updated);
    }
  );

  // ---------------------------
  // DELETE /api/public/arena/games/:gameId  (ADMIN)
  // We implement delete as "cancel" (soft delete)
  // ---------------------------
  fastify.delete(
    "/arena/games/:gameId",
    {
      preHandler: publicApiAdminOnly,
      schema: {
        tags: ["Public Arena"],
        params: z.object({ gameId: z.coerce.number().int() }),
        response: {
          204: z.null(),
          401: ApiError,
          403: ApiError,
          404: ApiError,
          400: ApiError,
          429: ApiError,
        },
      },
    },
    async (req, reply) => {
      const gameId = Number((req.params as any).gameId);
      if (!gameId || Number.isNaN(gameId)) {
        reply.status(400).send({ message: "Invalid gameId" });
        return;
      }

      const existing = await arenaRepository.getGameDetail(gameId);
      if (!existing) {
        reply.status(404).send({ message: "Arena game not found" });
        return;
      }

      await arenaRepository.cancel(gameId);
      reply.status(204).send(null);
    }
  );
};

export default publicApiRoutes;
