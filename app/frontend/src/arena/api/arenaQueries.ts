import { useQuery } from "@tanstack/react-query";
import { arenaApi } from "./arenaApi";
import type { ArenaGlobalMatch, ArenaHistoryItem, ArenaGameDetail, ArenaGamePlayerDetail } from "../types";

export const arenaQk = {
  recent: (limit: number) => ["arena-recent", limit],
  userHistory: (userId: number, limit: number) => ["arena-user-history", userId, limit],
  detail: (gameId: number) => ["arena-detail", gameId],
  players: (gameId: number) => ["arena-players", gameId],
};

export const useArenaRecentGlobal = (limit = 20) =>
  useQuery<ArenaGlobalMatch[], Error>({
    queryKey: arenaQk.recent(limit),
    queryFn: () => arenaApi.getRecentGlobal(limit),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const useArenaUserHistory = (userId: number, limit = 50) =>
  useQuery<ArenaHistoryItem[], Error>({
    queryKey: arenaQk.userHistory(userId, limit),
    queryFn: () => arenaApi.getUserHistory(userId, limit),
    enabled: !!userId,
  });

export const useArenaGameDetail = (gameId: number) =>
  useQuery<ArenaGameDetail, Error>({
    queryKey: arenaQk.detail(gameId),
    queryFn: () => arenaApi.getGameDetail(gameId),
    enabled: !!gameId,
  });

export const useArenaGamePlayers = (gameId: number) =>
  useQuery<ArenaGamePlayerDetail[], Error>({
    queryKey: arenaQk.players(gameId),
    queryFn: () => arenaApi.getGamePlayers(gameId),
    enabled: !!gameId,
  });
