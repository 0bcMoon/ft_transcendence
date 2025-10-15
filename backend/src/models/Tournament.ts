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

    // ... existing handlers
    start: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            await tournamentRepository.startTournament(Number(id));
            const t = await tournamentRepository.getTournament(Number(id));
            return reply.status(200).send({ tournament: t });
        } catch (e: any) {
            return reply.status(400).send({ error: e.message });
        }
    },

    // List all tournaments
    listTournaments: async (_req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournaments = await tournamentRepository.listTournaments();
            return reply.status(200).send({ tournaments });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to list tournaments", details: err.message });
        }
    },

    // Register (add) a player
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

    // List players in a tournament
    listPlayers: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = req.params as { id: string };
            const players = await tournamentRepository.listPlayers(Number(id));
            return reply.status(200).send({ players });
        } catch (err: any) {
            return reply.status(400).send({ error: "Failed to list players", details: err.message });
        }
    },

};
