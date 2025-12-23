// src/models/Tournament.ts

import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import tournamentRepository from "../repository/tournamentRepository";
import { createTournamentSchema } from "../schema/tournament.schema";
import { CreateTournamentData } from "../types/tournament.types";

export const Tournament = {
    /**
     * Create a new tournament
     */
    createTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!req.user) {
                return reply.status(401).send({ error: "Not authenticated" });
            }

            const userId = req.user.id;
            const data = createTournamentSchema.parse(req.body);

            const tournamentData: CreateTournamentData = {
                name: data.name,
                created_by: userId,
                max_players: data.max_players,
            };

            const tournamentId = await tournamentRepository.create(tournamentData);
            const tournament = await tournamentRepository.findById(tournamentId);

            if (!tournament) {
                return reply.status(500).send({ error: "Failed to retrieve tournament" });
            }

            return reply.status(201).send({ success: true, tournament });
        } catch (err) {
            if (err instanceof z.ZodError) {
                return reply.status(400).send({
                    error: "Validation failed",
                    details: err.errors.map(e => ({
                        field: e.path.join(". "),
                        message: e.message,
                    })),
                });
            }

            const error = err as Error;
            console.error("Create tournament error:", error);
            return reply.status(500).send({
                error: "Failed to create tournament",
                message: error.message,
            });
        }
    },

    /**
     * List all tournaments
     */
    listTournaments: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournaments = await tournamentRepository.findAll();
            return reply.status(200).send({ success: true, tournaments });
        } catch (err) {
            const error = err as Error;
            console.error("List tournaments error:", error);
            return reply.status(500).send({
                error: "Failed to fetch tournaments",
                message: error.message,
            });
        }
    },

    /**
     * Get tournament details
     */
    getTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournamentId = parseInt((req.params as any).id, 10);

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            const userId = req.user?.id;
            const tournament = await tournamentRepository.getDetails(tournamentId, userId);

            if (!tournament) {
                return reply.status(404).send({ error: "Tournament not found" });
            }

            return reply.status(200).send({ success: true, tournament });
        } catch (err) {
            const error = err as Error;
            console.error("Get tournament error:", error);
            return reply.status(500).send({
                error: "Failed to fetch tournament",
                message: error.message,
            });
        }
    },

    /**
     * Register player for tournament
     */
    registerPlayer: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!req.user) {
                return reply.status(401).send({ error: "Not authenticated" });
            }

            const tournamentId = parseInt((req.params as any).id, 10);
            const userId = req.user.id;

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            await tournamentRepository.registerPlayer(tournamentId, userId);

            return reply.status(200).send({
                success: true,
                message: "Successfully registered for tournament",
            });
        } catch (err) {
            const error = err as Error;
            console.error("Register player error:", error);
            return reply.status(400).send({
                error: error.message || "Failed to register",
            });
        }
    },

    /**
     * List all players in a tournament
     */
    getPlayer: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournamentId = parseInt((req.params as any).id, 10);

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            const players = await tournamentRepository.getPlayers(tournamentId);
            return reply.status(200).send({ success: true, players });
        } catch (err) {
            const error = err as Error;
            console.error("List players error:", error);
            return reply.status(500).send({
                error: "Failed to fetch players",
                message: error.message,
            });
        }
    },

    /**
     * Start a tournament
     */
    startTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!req.user) {
                return reply.status(401).send({ error: "Not authenticated" });
            }

            const tournamentId = parseInt((req.params as any).id, 10);
            const userId = req.user.id;

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            const tournament = await tournamentRepository.getDetails(tournamentId, userId);

            if (!tournament) {
                return reply.status(404).send({ error: "Tournament not found" });
            }

            if (tournament.created_by !== userId) {
                return reply.status(403).send({ error: "Only tournament creator can start it" });
            }

            if (!tournament.can_start) {
                return reply.status(400).send({
                    error: "Tournament cannot be started yet.  Wait for all players to register.",
                });
            }

            await tournamentRepository.start(tournamentId);

            return reply.status(200).send({
                success: true,
                message: "Tournament started successfully",
            });
        } catch (err) {
            const error = err as Error;
            console.error("Start tournament error:", error);
            return reply.status(400).send({
                error: error.message || "Failed to start tournament",
            });
        }
    },

    /**
     * Get tournament bracket
     */
    getBracket: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournamentId = parseInt((req.params as any).id, 10);

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            const bracket = await tournamentRepository.getBracket(tournamentId);

            if (!bracket) {
                return reply.status(404).send({
                    error: "Bracket not available yet. Tournament must be started first.",
                });
            }

            return reply.status(200).send({ success: true, bracket });
        } catch (err) {
            const error = err as Error;
            console.error("Get bracket error:", error);
            return reply.status(500).send({
                error: "Failed to fetch bracket",
                message: error.message,
            });
        }
    },

    /**
     * Get all games in a tournament
     */
    getTournamentGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournamentId = parseInt((req.params as any).id, 10);

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            const bracket = await tournamentRepository.getBracket(tournamentId);

            if (!bracket) {
                return reply.status(404).send({ error: "No games available yet" });
            }

            const allMatches = bracket.rounds.flatMap(round =>
                round.matches.map(match => ({
                    match_id: match.id,
                    game_id: match.game_id,
                    round: match.round,
                    match_number: match.match_number,
                    status: match.status,
                    player1: match.player1,
                    player2: match.player2,
                    winner: match.winner,
                }))
            );

            return reply.status(200).send({ success: true, games: allMatches });
        } catch (err) {
            const error = err as Error;
            console.error("Get tournament games error:", error);
            return reply.status(500).send({
                error: "Failed to fetch tournament games",
                message: error.message,
            });
        }
    },

    /**
     * Get games for a specific round
     */
    getRoundGames: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const tournamentId = parseInt((req.params as any).id, 10);
            const round = parseInt((req.params as any).round, 10);

            if (isNaN(tournamentId) || isNaN(round)) {
                return reply.status(400).send({ error: "Invalid tournament ID or round number" });
            }

            const bracket = await tournamentRepository.getBracket(tournamentId);

            if (!bracket) {
                return reply.status(404).send({ error: "Bracket not available yet" });
            }

            const roundData = bracket.rounds.find(r => r.round === round);

            if (!roundData) {
                return reply.status(404).send({ error: `Round ${round} not found` });
            }

            const games = roundData.matches.map(match => ({
                match_id: match.id,
                game_id: match.game_id,
                round: match.round,
                match_number: match.match_number,
                status: match.status,
                player1: match.player1,
                player2: match.player2,
                winner: match.winner,
            }));

            return reply.status(200).send({
                success: true,
                round: roundData.round,
                round_name: roundData.name,
                games,
            });
        } catch (err) {
            const error = err as Error;
            console.error("Get round games error:", error);
            return reply.status(500).send({
                error: "Failed to fetch round games",
                message: error.message,
            });
        }
    },

    /**
     * ✅ Get user's current match in a tournament
     */
    getUserMatch: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!req.user) {
                return reply.status(401).send({ error: "Not authenticated" });
            }

            const tournamentId = parseInt((req.params as any).id, 10);
            const userId = req.user.id;

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            const match = await tournamentRepository.getUserMatch(tournamentId, userId);

            if (!match) {
                return reply.status(200).send({
                    success: true,
                    match: null,
                    message: "No pending match found",
                });
            }

            return reply.status(200).send({
                success: true,
                match: {
                    id: match.id,
                    round: match.round,
                    match_number: match.match_number,
                    status: match.status,
                    player1: {
                        id: match.player1_id,
                        user_id: match.player1_user_id,
                        username: match.player1_username,
                    },
                    player2: {
                        id: match.player2_id,
                        user_id: match.player2_user_id,
                        username: match.player2_username,
                    },
                    game_id: match.game_id,
                    created_at: match.created_at,
                },
            });
        } catch (err) {
            const error = err as Error;
            console.error("Get user match error:", error);
            return reply.status(500).send({
                error: "Failed to fetch user match",
                message: error.message,
            });
        }
    },

    /**
     * Cancel a tournament
     */
    cancelTournament: async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!req.user) {
                return reply.status(401).send({ error: "Not authenticated" });
            }

            const tournamentId = parseInt((req.params as any).id, 10);
            const userId = req.user.id;

            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }

            const tournament = await tournamentRepository.getDetails(tournamentId, userId);

            if (!tournament) {
                return reply.status(404).send({ error: "Tournament not found" });
            }

            if (tournament.created_by !== userId) {
                return reply.status(403).send({ error: "Only tournament creator can cancel it" });
            }

            if (tournament.status === 'finished') {
                return reply.status(400).send({ error: "Cannot cancel a finished tournament" });
            }

            if (tournament.status === 'cancelled') {
                return reply.status(400).send({ error: "Tournament is already cancelled" });
            }

            await tournamentRepository.cancel(tournamentId);

            return reply.status(200).send({
                success: true,
                message: "Tournament cancelled successfully",
            });
        } catch (err) {
            const error = err as Error;
            console.error("Cancel tournament error:", error);
            return reply.status(500).send({
                error: "Failed to cancel tournament",
                message: error.message,
            });
        }
    },
};
