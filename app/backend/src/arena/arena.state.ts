// backend/src/arena/arena.state.ts

export type ArenaPlayerState = {
  userId: number;
  position: number; // 1 | 2
  x: number;
  y: number;
  roundsWon: number;
};

export type ArenaState = {
  gameId: number;
  status: "waiting" | "playing" | "finished" | "cancelled";
  players: ArenaPlayerState[];
  target: { x: number; y: number } | null;
  targetRoundWins: number;
};
