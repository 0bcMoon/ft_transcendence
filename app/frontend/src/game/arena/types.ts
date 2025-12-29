export type ArenaStatus = "waiting" | "playing" | "finished" | "cancelled";

export type ArenaPlayerState = {
  userId: number;
  position: 1 | 2;
  x: number;
  y: number;
  roundsWon: number;
};

export type ArenaState = {
  gameId: number;
  status: ArenaStatus;
  players: ArenaPlayerState[];
  target: { x: number; y: number } | null;
  targetRoundWins: number;
};

export type ArenaWsMessage =
  | { type: "arena:joined"; playerPosition: 1 | 2 }
  | { type: "arena:state"; state: ArenaState }
  | { type: "arena:error"; message: string };
