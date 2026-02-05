import { useQuery } from '@tanstack/react-query';
import { gameApi} from '../api/gameApi';
import type {
    GlobalMatch,
    PlayerStats,
    MatchDetail,
    RecentMatch, 
    XPProgressPoint,
    TournamentList,
    TournamentPlayer,
    TopPlayer,
    TournamentBasic,
    Champion

} from '../types/types';


export const useGetGameDetail = (gameId: number) => {
    return useQuery<MatchDetail, Error>({
        queryKey: ['match-detail', gameId],
        queryFn: () => gameApi.getGameDetail(gameId),
        enabled: !!gameId,
    });
};

export function useTournamentBracket(tournamentId: number) {
    return useQuery({
        queryKey: ['tournament', tournamentId, 'bracket'],
        queryFn: () => gameApi.getBracket(tournamentId),
        enabled: !!tournamentId && tournamentId > 0,
    });
}

export const useListTournaments = () => {
    return useQuery<TournamentList[], Error>({
        queryKey: ['tournaments'],
        queryFn: () => gameApi.getAll(),
    });
};


export const useGetTopPlayers = (limit: number = 10) => {
    return useQuery<TopPlayer[]>({
        queryKey: ['top-players', limit],
        queryFn: () => gameApi.getTopPlayers(limit),
        enabled: limit > 0,
    });
};

export const useGetUserStats = (userId: number) => {
    return useQuery<PlayerStats, Error>({
        queryKey: ['user-stats', userId],
        queryFn: () => gameApi.getUserStats(userId),
        enabled: !!userId,
    });
};

export const useGetUserXPProgression = (userId: number, limit: number = 30) => {
    return useQuery<XPProgressPoint[], Error>({
        queryKey: ['user-xp-progression', userId, limit],
        queryFn: () => gameApi.getXPProgress(userId, limit),
        enabled: !!userId && limit > 0,
    });
};


export const useGetUserMatches = (userId: number, page: number = 1, limit: number = 10) => {
    return useQuery<RecentMatch[], Error>({
        queryKey: ['recent-matches', userId, page, limit],
        queryFn: () => gameApi.getUserMatches(userId, page, limit),
        enabled: !!userId,
    });
};

export const useGetGlobalMatches = (page: number = 1, limit: number = 10) => {
    return useQuery<GlobalMatch[], Error>({
        queryKey: ['global-matches', page, limit],
        queryFn: () => gameApi.getGlobalMatches(page, limit),
        enabled: page > 0 && limit > 0,
    });
};

export const useListPlayers = (tournamentId: number) => {
    return useQuery<TournamentPlayer[], Error>({
        queryKey: ['tournament-players', tournamentId],
        queryFn: () => gameApi.getPlayers(tournamentId),
        enabled: !!tournamentId,
    });
};


export function useTournamentOverview(id: number) {
    return useQuery({
        queryKey: ['tournament', id, 'overview'],
        queryFn: () => gameApi.Overview(id),
        enabled: !!id && id > 0,
    });
}

export function useUserMatch(tournamentId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['tournament', tournamentId, 'user-match'],
        queryFn: () => gameApi.getUserMatch(tournamentId),
        enabled: enabled && !!tournamentId && tournamentId > 0,
    });
}

export function useTournamentPlayers(tournamentId: number) {
    return useQuery<TournamentPlayer[]>({
        queryKey: ['tournament', tournamentId, 'players'],
        queryFn: () => gameApi.getPlayers(tournamentId),
        enabled: !!tournamentId && tournamentId > 0,
    });
}

export function useTournamentBasic(id: number) {
    return useQuery<TournamentBasic, Error>({
        queryKey: ["tournaments", "players", id],
        queryFn: () => gameApi.getTournamentBasic(id),
        enabled: !!id && id > 0,
        retry: false,
    });
}

export function useGetChampion(tournamentId: number) {
    return useQuery<Champion | null, Error>({
        queryKey: ['tournament', tournamentId, 'champion'],
        queryFn: () => gameApi.getChampion(tournamentId),
        enabled: tournamentId > 0,
    });
}
