const API_BASE = "http://localhost:3000/api";
const WS_BASE = "ws://localhost:3000/ws";

export const arenaApi = {
  API_BASE,
  WS_BASE,
  
  async getMatchmakingStatus() {
    const res = await fetch(`${API_BASE}/arena/matchmaking/status`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to get matchmaking status");
    }
    return data;
  },

  async joinMatchmaking() {
    const res = await fetch(`${API_BASE}/arena/matchmaking/join`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to join matchmaking");
    }
    return data;
  },

  async leaveMatchmaking() {
    const res = await fetch(`${API_BASE}/arena/matchmaking/leave`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to leave matchmaking");
    }
    return data;
  },

  async getMyHistory() {
    const res = await fetch(`${API_BASE}/arena/me/history`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to get arena history");
    }
    return data;
  },

  async getMyStats() {
    const res = await fetch(`${API_BASE}/arena/me/stats`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to get arena stats");
    }
    return data;
  },

  async createAIGame() {
    const res = await fetch(`${API_BASE}/arena/games/ai`, {
      method: "POST",
      credentials: "include",
    });
  
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to create AI game");
    }
    return data as { gameId: number };
  },

  async getGamesByStatus(status: "waiting" | "playing" | "finished" | "cancelled") {
    const res = await fetch(`${API_BASE}/arena/games?status=${status}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.details || data?.error || "Failed to load arena games");
    return data as {
      games: Array<{
        id: number;
        status: string;
        winner_user_id: number | null;
        target_round_wins: number;
        created_at: string;
        started_at: string | null;
        ended_at: string | null;
      }>;
    };
  },

  async getGamePlayers(gameId: number) {
    const res = await fetch(`${API_BASE}/arena/games/${gameId}/players`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ([]));
    if (!res.ok) throw new Error("Failed to load arena players");

    return data as Array<{
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
    }>;
  },
};