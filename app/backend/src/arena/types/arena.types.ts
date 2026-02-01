export type ArenaGameStatus = "waiting" | "playing" | "finished" | "cancelled";

export interface ArenaGameDetail {
  id: number;
  status: ArenaGameStatus;
  winner_user_id: number | null;        // ✅ match schema
  target_round_wins: number;            // ✅ match schema
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface ArenaGamePlayerDetail {
  position: number;
  user_id: number | null;
  username: string | null;
  display_name: string | null;
  profile_picture: string | null;
  image_src: string | null;

  round_wins: number;                   // ✅ match schema/repo
  is_ai: boolean;

  last_x: number;                       // ✅ match schema/repo
  last_y: number;

  joined_at: string;
}
