import { FastifyReply, FastifyRequest } from "fastify";
import { gameRepository, UserStats, Game } from "../repository/gameRepository";

// If you use fastify-jwt or a custom auth decorator, adapt this shape to your project.
type AuthUser = { id: number };
type AuthedRequest = FastifyRequest & { user: AuthUser };

// Request body types
interface CreateGameBody {
    mode: Game["mode"];
    max_players: number;
    status?: Game["status"]; // optional, defaults to 'waiting'
}

interface AddPlayerBody {
    game_id: number;
    user_id: number;
    team?: string | null;
    position?: string | null; // e.g. 'left' | 'right' for 1v1
}

interface UpdatePlayerStatsBody {
    game_id: number;
    user_id: number;
    score: number;
    goals_scored: number;
    goals_conceded: number;
    accuracy: number;
}

interface UpdateGameStatusBody {
    status: Game["status"];
}

interface FinishGameBody {
    duration: number; // seconds
}

// Helpers
const parseIdParam = (req: FastifyRequest, key: string = "id"): number | null => {
    const { [key]: raw } = (req.params as Record<string, string | number> | undefined) ?? {};
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const badRequest = (reply: FastifyReply, message: string) =>
    reply.code(400).send({ message });

const notFound = (reply: FastifyReply, message: string) =>
    reply.code(404).send({ message });

export const GameController = {
    // Create a new game
    async createGame(req: FastifyRequest, reply: FastifyReply) {
        const { mode, max_players, status } = req.body as CreateGameBody;

        if (!mode || typeof mode !== "string") {
            return badRequest(reply, "Invalid or missing 'mode'.");
        }
        if (!Number.isFinite(max_players) || max_players <= 0) {
            return badRequest(reply, "Invalid 'max_players'. Must be a positive number.");
        }
        const gameId = await gameRepository.createGame(mode, max_players, status ?? "waiting");
        return reply.code(201).send({ game_id: gameId, message: "Game created successfully" });
    },

    // Get a game by ID
    async getGameById(req: FastifyRequest, reply: FastifyReply) {
        const id = parseIdParam(req);
        if (!id) return badRequest(reply, "Invalid 'id' parameter.");

        const game = await gameRepository.getGameById(id);
        if (!game) return notFound(reply, "Game not found");
        return reply.code(200).send(game);
    },

    // Get a game with its players
    async getGameDetailsWithPlayers(req: FastifyRequest, reply: FastifyReply) {
        const id = parseIdParam(req);
        if (!id) return badRequest(reply, "Invalid 'id' parameter.");

        const details = await gameRepository.getGameDetailsWithPlayers(id);
        if (!details) return notFound(reply, "Game not found");
        return reply.code(200).send(details);
    },

    // Get recent games for the current user
    async getRecentGamesForUser(req: AuthedRequest, reply: FastifyReply) {
        const limitRaw = (req.query as { limit?: string | number } | undefined)?.limit;
        const limit = limitRaw ? Number(limitRaw) : 10;
        const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Number(limit), 50) : 10;

        const games = await gameRepository.getRecentGamesForUser(req.user.id, safeLimit);
        return reply.code(200).send(games);
    },

    // Update game status
    async updateGameStatus(req: FastifyRequest, reply: FastifyReply) {
        const id = parseIdParam(req);
        if (!id) return badRequest(reply, "Invalid 'id' parameter.");

        const { status } = req.body as UpdateGameStatusBody;
        if (!status) return badRequest(reply, "Missing 'status'.");

        const updated = await gameRepository.updateGameStatus(id, status);
        if (!updated) return notFound(reply, "Game not found or status unchanged");
        return reply.code(200).send({ message: "Game status updated" });
    },

    // Start a match (sets status to 'in-progress')
    async startMatch(req: FastifyRequest, reply: FastifyReply) {
        const id = parseIdParam(req);
        if (!id) return badRequest(reply, "Invalid 'id' parameter.");

        const updated = await gameRepository.startMatch(id);
        if (!updated) return notFound(reply, "Game not found or status unchanged");
        return reply.code(200).send({ message: "Match started" });
    },

    // Finish a game
    async finishGame(req: FastifyRequest, reply: FastifyReply) {
        const id = parseIdParam(req);
        if (!id) return badRequest(reply, "Invalid 'id' parameter.");

        const { duration } = req.body as FinishGameBody;
        if (!Number.isFinite(duration) || duration < 0) {
            return badRequest(reply, "Invalid 'duration'. Must be a non-negative number.");
        }

        const updated = await gameRepository.finishGame(id, duration);
        if (!updated) return notFound(reply, "Game not found or could not be finished");
        return reply.code(200).send({ message: "Game finished successfully" });
    },

    // End a match (alias for finishGame)
    async endMatch(req: FastifyRequest, reply: FastifyReply) {
        const id = parseIdParam(req);
        if (!id) return badRequest(reply, "Invalid 'id' parameter.");

        const { duration } = req.body as FinishGameBody;
        if (!Number.isFinite(duration) || duration < 0) {
            return badRequest(reply, "Invalid 'duration'. Must be a non-negative number.");
        }

        const updated = await gameRepository.endMatch(id, duration);
        if (!updated) return notFound(reply, "Game not found or could not be finished");
        return reply.code(200).send({ message: "Match ended" });
    },

    // Add a player to a game
    async addPlayerToGame(req: FastifyRequest, reply: FastifyReply) {
        const { game_id, user_id, team = null, position = null } = req.body as AddPlayerBody;

        if (!Number.isFinite(game_id) || game_id <= 0) {
            return badRequest(reply, "Invalid 'game_id'.");
        }
        if (!Number.isFinite(user_id) || user_id <= 0) {
            return badRequest(reply, "Invalid 'user_id'.");
        }

        const playerId = await gameRepository.addPlayerToGame(game_id, user_id, team, position);
        return reply.code(201).send({ player_id: playerId, message: "Player added to game" });
    },

    // Update player stats in a game
    async updatePlayerStats(req: FastifyRequest, reply: FastifyReply) {
        const { game_id, user_id, score, goals_scored, goals_conceded, accuracy } =
            req.body as UpdatePlayerStatsBody;

        if (!Number.isFinite(game_id) || game_id <= 0) return badRequest(reply, "Invalid 'game_id'.");
        if (!Number.isFinite(user_id) || user_id <= 0) return badRequest(reply, "Invalid 'user_id'.");
        if (!Number.isFinite(score)) return badRequest(reply, "Invalid 'score'.");
        if (!Number.isFinite(goals_scored)) return badRequest(reply, "Invalid 'goals_scored'.");
        if (!Number.isFinite(goals_conceded)) return badRequest(reply, "Invalid 'goals_conceded'.");
        if (!Number.isFinite(accuracy)) return badRequest(reply, "Invalid 'accuracy'.");

        const updated = await gameRepository.updatePlayerStats(
            game_id,
            user_id,
            score,
            goals_scored,
            goals_conceded,
            accuracy
        );
        if (!updated) return notFound(reply, "Player not found in game");
        return reply.code(200).send({ message: "Player stats updated" });
    },

    // Get all players in a game
    async getPlayersInGame(req: FastifyRequest, reply: FastifyReply) {
        const id = parseIdParam(req);
        if (!id) return badRequest(reply, "Invalid 'id' parameter.");

        const players = await gameRepository.getPlayersInGame(id);
        return reply.code(200).send(players);
    },

    // Get user stats (for current user)
    async getUserStats(req: AuthedRequest, reply: FastifyReply) {
        const stats = await gameRepository.getUserStats(req.user.id);
        if (!stats) return notFound(reply, "Stats not found");
        return reply.code(200).send(stats);
    },

    // Update user stats (for current user)
    async updateUserStats(req: AuthedRequest, reply: FastifyReply) {
        const body = req.body as Partial<UserStats>;
        // Remove user_id if provided (not updatable here)
        if (body && "user_id" in body) delete (body as Partial<UserStats>).user_id;

        const updated = await gameRepository.updateUserStats(req.user.id, body);
        if (!updated) return notFound(reply, "Stats not found or unchanged");
        return reply.code(200).send({ message: "User stats updated" });
    },
};

export default GameController;
