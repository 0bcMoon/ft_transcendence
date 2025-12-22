export type ArenaMode = "remote" | "ai";
export type ArenaStatus = "waiting" | "playing" | "finished" | "cancelled";
export type Side = "p1" | "p2";

export type ClientMessage =
  | {
      type: "join";
      mode: ArenaMode;
      username: string;
      avatar?: string | null;
    }
  | { type: "ready" }
  | {
      type: "move";
      up?: boolean;
      down?: boolean;
      left?: boolean;
      right?: boolean;
    }
  | { type: "playAgain"; mode: ArenaMode }
  | { type: "leave" };

export type ServerMessage =
  | {
      type: "matchFound";
      arenaGameId: number;
      mode: ArenaMode;
      side: Side;
      playerNames: { p1: string; p2: string };
      playerAvatars: { p1: string | null; p2: string | null };
    }
  | { type: "countdown"; count: number }
  | { type: "state"; state: ArenaState }
  | { type: "gameOver"; winner: Side; score: { p1: number; p2: number } }
  | { type: "opponentLeft" }
  | { type: "error"; message: string };

export type ArenaPlayer = {
  id: number; // user id for humans
  username: string;
  avatar?: string | null;
  socket?: import("ws").WebSocket;
  mode?: ArenaMode;
  arenaGameId?: number;
  isAI?: boolean;
};

export type Vec2 = { x: number; y: number };

export type ArenaState = {
  tick: number;
  target: { x: number; y: number; r: number };
  p1: { x: number; y: number; size: number };
  p2: { x: number; y: number; size: number };
  score: { p1: number; p2: number };
};

export type ArenaGameDetail = {
  id: number;
  mode: ArenaMode;
  status: ArenaStatus;
  winner_user_id: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

export type ArenaGamePlayerDetail = {
  position: number;
  user_id: number | null;
  username: string | null;
  display_name: string | null;
  profile_picture: string | null;
  image_src: string | null;
  score: number | null;
  is_ai: boolean;
  joined_at: string;
};
