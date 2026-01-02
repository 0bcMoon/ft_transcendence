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
};


