const API_BASE = "http://localhost:3000/api";
const WS_BASE = "ws://localhost:3000/ws";

export const arenaApi = {
  API_BASE,
  WS_BASE,
  async createGame(payload: {
    players: { user_id: number | null; position: 1 | 2; is_ai?: boolean }[];
    target_round_wins?: number;
  }) {
    const res = await fetch(`${API_BASE}/arena/games`, {
      method: "POST",
      credentials: "include", // ✅ cookie auth
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.details || data?.error || "Failed to create arena game");
    return data;
  },
};
