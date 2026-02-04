
import { FastifyReply, FastifyRequest } from "fastify";
import tournamentRepository from "../repository/tournamentRepository";
import { userRepository } from "../repository/userRepository";
import { notifyTournamentCreated, notifyTournamentStarted } from "../notification.service";

export const Tournament = {

    createTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        const { name, max_players} = req.body as {
            name: string;
            max_players: number;
        };

        const creator = await userRepository.getCurrentUserById(req.user.id);
        if (!creator) {
            return reply.status(400).send({ error: "Creator user not found" });
        }

        const tournamentId = await tournamentRepository.create(name, max_players, creator.id);

        if (!tournamentId) {
            return reply.status(500).send({ error: "Failed to create tournament" });
        }

        await notifyTournamentCreated(tournamentId, name, creator);

        return reply.status(201).send({ id: tournamentId });
    },

    getChampion: async (req: FastifyRequest, reply: FastifyReply) => {

        const { id: tournamentId } = req.params as { id: number };
        const exists = await tournamentRepository.tournamentExists(tournamentId);
        if (!exists) {
            return reply.status(404).send({ error: "Tournament not found" });
        }
        const champion = await tournamentRepository.getChampion(tournamentId);
        return reply.status(200).send(champion);
    },

    listTournaments: async (req: FastifyRequest, reply: FastifyReply) => {
        const tournaments = await tournamentRepository.getTournaments();
        return reply.status(200).send(tournaments);
    },

    registerPlayer: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id: tournamentId } = req.params as { id: number };
        const userId = req.user.id;

        const exists = await tournamentRepository.tournamentExists(tournamentId);
        if (!exists)
            return reply.status(404).send({ error: "Tournament not found" });

        const open = await tournamentRepository.isRegistrationOpen(tournamentId);
        if (!open)
            return reply.status(403).send({ error: "Registration closed" });

        const already = await tournamentRepository.isAlreadyRegistered(tournamentId, userId);
        if (already)
            return reply.status(400).send({ error: "Already registered" });

        const count = await tournamentRepository.playerCount(tournamentId);
        const max = await tournamentRepository.maxPlayers(tournamentId);
        if (count >= max)
            return reply.status(400).send({ error: "Tournament is full" });

        await tournamentRepository.register(tournamentId, userId);
        if (count + 1 === max) {
            await tournamentRepository.start(tournamentId);
            const name = await tournamentRepository.getTournamentName(tournamentId);
            if (name)
                notifyTournamentStarted(tournamentId, name);
        }
        return reply.status(200).send({ success: true });
    },

    listPlayers: async (req: FastifyRequest, reply: FastifyReply) => {

        const { id: tournamentId } = req.params as { id: number };

        const exists = await tournamentRepository.tournamentExists(tournamentId);
        if (!exists) {
            return reply.status(404).send({ error: "Tournament not found" });
        }
        const players = await tournamentRepository.getPlayers(tournamentId);
        return reply.status(200).send(players);
    },


    getTournamentOverview: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id: tournamentId } = req.params as { id: number };

        const exists = await tournamentRepository.tournamentExists(tournamentId);
        if (!exists) {
            return reply.status(404).send({ error: "Tournament not found", });
        }

        const overview = await tournamentRepository.getOverview(tournamentId);
        return reply.status(200).send(overview);
    },

    getBracket: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id: tournamentId } = req.params as { id: number };

        const exists = await tournamentRepository.tournamentExists(tournamentId);
        if (!exists) {
            return reply.status(404).send({ error: "Tournament not found", });
        }

        const bracket = await tournamentRepository.getBracket(tournamentId);
        if (!bracket) {
            return reply.status(404).send({ error: "Bracket not available yet", });
        }
        return reply.status(200).send({ success: true, bracket });
    },


    getTournamentBasic: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id: tournamentId } = req.params as { id: number };

        const userId = (req.user as { id: number }).id;

        const tournament = await tournamentRepository.getTournament(tournamentId, userId);

        if (!tournament) {
            return reply.status(404).send({ error: "Tournament not found" });
        }
        return reply.status(200).send(tournament);

    },

    getUserMatch: async (req: FastifyRequest, reply: FastifyReply) => {
        const { id: tournamentId } = req.params as { id: number };
        const userId = req.user.id;

        const exists = await tournamentRepository.tournamentExists(tournamentId);
        if (!exists) {
            return reply.status(404).send({ error: "Tournament not found" });
        }

        const match = await tournamentRepository.getUserMatch(tournamentId, userId);

        return reply.status(200).send({ match: match ?? null});
    },

};

