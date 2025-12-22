export const ArenaConfig = {
    CANVAS: { W: 1100, H: 600 },
    PLAYER: { SIZE: 28, SPEED: 5 },
    TARGET: { R: 14 },
    WIN_SCORE: 5,
    TICK_MS: 16,
    COUNTDOWN: 3,
    AI: {
      SPEED: 4.2,
      REACTION: 0.08, // lower = dumber, higher = sharper
      WANDER: 0.25, // randomness
    },
  } as const;
  