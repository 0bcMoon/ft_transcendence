import { FastifyReply, FastifyRequest } from "fastify";
import tournamentRepository from "../repository/tournamentRepository";

export const Tournament = {
    /**
     * Create a new tournament
     * POST /tournaments
     * Body: { name: string, max_players?: number }
     */
    createTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { name, max_players } = req.body as { name: string; max_players?: number };
            const id = await tournamentRepository.createTournament(name, max_players ?? 8);
            const tournament = await tournamentRepository.getTournament(id);
            return reply.status(201).send({ tournament });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to create tournament", details: err.message });
        }
    },

    /**
     * Get tournament by ID
     * GET /tournaments/:id
     */
    getTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const tournament = await tournamentRepository.getTournament(Number(id));
            if (!tournament) {
                return reply.status(404).send({ error: "Tournament not found" });
            }
            return reply.status(200).send({ tournament });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get tournament", details: err.message });
        }
    },

    /**
     * List all tournaments
     * GET /tournaments
     */
    listTournaments: async (_req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournaments = await tournamentRepository.listTournaments();
            return reply.status(200).send({ tournaments });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to list tournaments", details: err.message });
        }
    },

    /**
     * Register a player to a tournament
     * POST /tournaments/:id/register
     * Body: { user_id: number, alias: string }
     */
    registerPlayer: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const { user_id, alias } = req.body as { user_id: number; alias: string };

            if (typeof user_id !== "number" || !alias) {
                return reply.status(400).send({ error: "user_id and alias required" });
            }

            const regId = await tournamentRepository.registerPlayer(Number(id), user_id, alias);
            const players = await tournamentRepository.listPlayers(Number(id));
            return reply.status(201).send({ registration_id: regId, players });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to register player", details: err.message });
        }
    },

    /**
     * List players in a tournament
     * GET /tournaments/:id/players
     */
    listPlayers: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const players = await tournamentRepository.listPlayers(Number(id));
            return reply.status(200).send({ players });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to list players", details: err.message });
        }
    },

    /**
     * Start a tournament (creates Round 1 games)
     * POST /tournaments/:id/start
     */
    start: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            await tournamentRepository.startTournament(Number(id));
            const tournament = await tournamentRepository.getTournament(Number(id));
            return reply.status(200).send({ tournament });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to start tournament", details: err.message });
        }
    },

    /**
     * Advance to next round (after current round finishes)
     * POST /tournaments/:id/advance
     */
    advanceRound: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            await tournamentRepository.advanceRound(Number(id));
            const tournament = await tournamentRepository.getTournament(Number(id));
            return reply.status(200).send({
                tournament,
                message: tournament?.status === 'finished'
                    ? 'Tournament completed!'
                    : 'Advanced to next round'
            });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to advance round", details: err.message });
        }
    },

    /**
     * Get all games in a tournament
     * GET /tournaments/:id/games
     */
    getTournamentGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const games = await tournamentRepository.getTournamentGames(Number(id));
            return reply.status(200).send({ games });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get tournament games", details: err.message });
        }
    },

    /**
     * Get games for a specific round
     * GET /tournaments/:id/rounds/:round/games
     */
    getRoundGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id, round } = req.params as { id: string; round: string };
            const games = await tournamentRepository.getRoundGames(Number(id), Number(round));
            return reply.status(200).send({ games });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get round games", details: err.message });
        }
    },

    /**
     * Get full tournament bracket (for UI display)
     * GET /tournaments/:id/bracket
     */
    getBracket: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const bracket = await tournamentRepository.getBracket(Number(id));
            return reply.status(200).send(bracket);
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get bracket", details: err.message });
        }
    },

    /**
     * Cancel a tournament
     * POST /tournaments/:id/cancel
     */
    cancelTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            await tournamentRepository.cancelTournament(Number(id));
            const tournament = await tournamentRepository.getTournament(Number(id));
            return reply.status(200).send({ tournament, message: "Tournament cancelled" });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to cancel tournament", details: err.message });
        }
    },
};
