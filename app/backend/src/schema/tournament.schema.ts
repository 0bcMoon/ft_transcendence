import { z } from "zod";

export const createTournamentSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Tournament name must be at least 3 characters")
        .max(64, "Tournament name must be less than 64 characters"),
    max_players: z
        .number()
        .int()
        .refine((val) => [4, 8, 16].includes(val), {
            message: "Max players must be 4, 8, or 16",
        })
        .default(8),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
