import api from "@/api/api";
import type {
  ArenaGlobalMatch,
  ArenaHistoryItem,
  ArenaGameDetail,
  ArenaGamePlayerDetail,
} from "../types";

export const arenaApi = {
  async getRecentGlobal(limit = 20): Promise<ArenaGlobalMatch[]> {
    const { data } = await api.get<ArenaGlobalMatch[]>(`/api/arena/games/recent?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  },

  async getUserHistory(userId: number, limit = 50): Promise<ArenaHistoryItem[]> {
    const { data } = await api.get<ArenaHistoryItem[]>(
      `/api/arena/users/${userId}/history?limit=${limit}`
    );
    return Array.isArray(data) ? data : [];
  },

  async getGameDetail(gameId: number): Promise<ArenaGameDetail> {
    const { data } = await api.get<ArenaGameDetail>(`/api/arena/games/${gameId}/detail`);
    return data;
  },

  async getGamePlayers(gameId: number): Promise<ArenaGamePlayerDetail[]> {
    const { data } = await api.get<ArenaGamePlayerDetail[]>(`/api/arena/games/${gameId}/players`);
    return Array.isArray(data) ? data : [];
  },
};
