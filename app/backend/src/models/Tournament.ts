import { FastifyReply, FastifyRequest } from "fastify";
import tournamentRepository from "../repository/tournamentRepository";

export const Tournament = {
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

    listTournaments: async (_req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournaments = await tournamentRepository.listTournaments();
            return reply.status(200).send({ tournaments });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to list tournaments", details: err.message });
        }
    },

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

    listPlayers: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const players = await tournamentRepository.listPlayers(Number(id));
            return reply.status(200).send({ players });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to list players", details: err.message });
        }
    },

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

    advanceRound: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            await tournamentRepository.advanceRound(Number(id));
            const tournament = await tournamentRepository.getTournament(Number(id));
            return reply.status(200).send({
                tournament, message: tournament?.status === 'finished' ? 'Tournament completed!' : 'Advanced to next round'
            });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to advance round", details: err.message });
        }
    },

    getTournamentGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const games = await tournamentRepository.getTournamentGames(Number(id));
            return reply.status(200).send({ games });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get tournament games", details: err.message });
        }
    },

    getRoundGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id, round } = req.params as { id: string; round: string };
            const games = await tournamentRepository.getRoundGames(Number(id), Number(round));
            return reply.status(200).send({ games });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get round games", details: err.message });
        }
    },

    getBracket: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const bracket = await tournamentRepository.getBracket(Number(id));
            return reply.status(200).send(bracket);
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to get bracket", details: err.message });
        }
    },

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
