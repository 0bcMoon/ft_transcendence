import {z} from "zod"

export const ArenaGameIdCheck = z.object ({
    gameId : z.coerce.number().int().positive()
})


export const MatchmakingResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("idle"),
  }),
  z.object({
    status: z.literal("queued"),
  }),
  z.object({
    status: z.literal("matched"),
    gameId: z.number().int().positive(),
  }),
]);

export const LeaveResultSchema = z.object({
  status: z.literal("left"),
});

export const ArenaMeStatsSchema = z.object({
  gamesPlayed: z.number().int().nonnegative(),
  gamesWon: z.number().int().nonnegative(),
  gamesLost: z.number().int().nonnegative(),
  winRate: z.number().min(0).max(1), // or 0..100 depending on your implementation
  totalRoundsWon: z.number().int().nonnegative(),
});

export const ArenaHistoryItemSchema = z.object({
  gameId: z.number().int().positive(),
  status: z.enum(["finished", "cancelled"]), // or include "playing" if you return those
  startedAt: z.string().nullable(),          // ISO timestamps are strings
  endedAt: z.string().nullable(),
  targetRoundWins: z.number().int().positive(),
  // optional extras:
  winnerUserId: z.number().int().positive().nullable(),
  myPosition: z.number().int().min(1).max(2).optional(),
  myRoundsWon: z.number().int().nonnegative().optional(),
  oppRoundsWon: z.number().int().nonnegative().optional(),
});

export const ArenaMeHistorySchema = z.array(ArenaHistoryItemSchema);
