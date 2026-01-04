const API_BASE = "http://localhost:3000/api";
const WS_BASE = "ws://localhost:3000/ws";

export const arenaApi = {
  API_BASE,
  WS_BASE,
  
    // --------------------
  // Matchmaking: STATUS
  // --------------------
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

  // --------------------
  // Create arena game
  // --------------------
  async createGame(payload: {
    players: { user_id: number | null; position: 1 | 2; is_ai?: boolean }[];
    target_round_wins?: number;
  }) {
    const res = await fetch(`${API_BASE}/arena/games`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to create arena game");
    }
    return data;
  },

  // --------------------
  // Matchmaking: JOIN
  // --------------------
  async joinMatchmaking() {
    const res = await fetch(`${API_BASE}/arena/matchmaking/join`, {
      method: "POST",
      credentials: "include",
      // ❌ NO Content-Type
      // ❌ NO body
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to join matchmaking");
    }
    return data;
  },

  // --------------------
  // Matchmaking: LEAVE
  // --------------------
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

  // --------------------
  // Arena: MY HISTORY
  // --------------------
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

   // --------------------
  // Arena: MY STATS
  // --------------------
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
      // no body, no Content-Type (avoids empty JSON body issue)
    });
  
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to create AI game");
    }
    return data as { gameId: number };
  },
  
  // ✅ list games by status (waiting/playing/finished/cancelled)
  async getGamesByStatus(status: "waiting" | "playing" | "finished" | "cancelled") {
    const res = await fetch(`${API_BASE}/arena/games?status=${status}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.details || data?.error || "Failed to load arena games");
    // backend returns { games }
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

  // ✅ fetch players for a game (for names/avatars)
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