export type ArenaMode = "remote" | "ai";
export type Side = "p1" | "p2";

export type ArenaState = {
  tick: number;
  target: { x: number; y: number; r: number };
  p1: { x: number; y: number; size: number };
  p2: { x: number; y: number; size: number };
  score: { p1: number; p2: number };
};

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

export type ArenaGlobalMatch = {
  matchId: number;
  mode: ArenaMode;
  date: string;
  player1_name: string;
  player1_avatar: string | null;
  player1_score: number;
  player2_name: string;
  player2_avatar: string | null;
  player2_score: number;
  winner_id: number | null;
};

export type ArenaHistoryItem = {
  matchId: number;
  mode: ArenaMode;
  date: string;
  isWin: number;
  user_score: number;
  opponent_score: number;
  opponent_name: string | null;
  opponent_avatar: string | null;
};

export type ArenaGameDetail = {
  id: number;
  mode: ArenaMode;
  status: string;
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
