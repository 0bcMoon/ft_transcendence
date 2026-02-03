export type ArenaGameStatus = "waiting" | "playing" | "finished" | "cancelled";

export interface ArenaGameDetail {
  id: number;
  status: ArenaGameStatus;
  winner_user_id: number | null;
  target_round_wins: number;
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

  round_wins: number;
  is_ai: boolean;

  last_x: number;
  last_y: number;

  joined_at: string;
}
