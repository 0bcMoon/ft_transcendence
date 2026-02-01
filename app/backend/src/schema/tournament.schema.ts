import { z } from "zod";

export const createTournamentSchema = z.object({
    name: z.string()
        .min(3, "Tournament name must be at least 3 characters")
        .max(64, "Tournament name must be less than 64 characters")
        .trim(),
    max_players: z.number()
        .int("Must be an integer")
        .positive("Must be positive")
        .refine(val => [4, 8, 16].includes(val), {
            message: "Must be 4, 8, or 16 players"
        }),
    start_time: z.string(),

});


export const tournamentIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export const topPlayersSchema = z.object({
    limit: z.coerce.number().int().positive().optional().default(6),
});

export const userIdParamsSchema = z.object({
    userId: z.coerce.number().int().positive()
});

export const gameIdParamsSchema = z.object({
    gameId: z.coerce.number().int().positive(),
});

export const xpProgressQuerySchema = z.object({
    limit: z.coerce.number().int().positive().optional().default(30),
});

export const recentMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().optional().default(10),
    offset: z.coerce.number().int().nonnegative().optional().default(0),
});
