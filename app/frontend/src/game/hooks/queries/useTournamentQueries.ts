import { useQuery } from '@tanstack/react-query';
import { tournamentApi } from '../../api/tournament.api';
import { tournamentKeys } from '../keys/tournament.keys';

export function useTournaments() {
    return useQuery({
        queryKey: tournamentKeys.lists(),
        queryFn: () => tournamentApi.getAll(),
        staleTime: 30 * 1000,
    });
}

export function useTournament(id: number) {
    console.log('useTournament called with id:', id);
    return useQuery({
        queryKey: tournamentKeys.detail(id),
        queryFn: () => tournamentApi.getById(id),
        enabled: !!id && id > 0,
        staleTime: 10 * 1000,
    });
}

export function useTournamentPlayers(tournamentId: number) {
    return useQuery({
        queryKey: tournamentKeys.players(tournamentId),
        queryFn: () => tournamentApi.getPlayers(tournamentId),
        enabled: !!tournamentId && tournamentId > 0,
        staleTime: 10 * 1000, // 10 seconds
    });
}

export function useTournamentBracket(tournamentId: number) {
    return useQuery({
        queryKey: tournamentKeys.bracket(tournamentId),
        queryFn: () => tournamentApi.getBracket(tournamentId),
        enabled: !!tournamentId && tournamentId > 0,
        staleTime: 5 * 1000, // 5 seconds
    });
}

export function useTournamentGames(tournamentId: number) {
    return useQuery({
        queryKey: tournamentKeys.games(tournamentId),
        queryFn: () => tournamentApi.getGames(tournamentId),
        enabled: !!tournamentId && tournamentId > 0,
        staleTime: 10 * 1000, // 10 seconds
    });
}

export function useRoundGames(tournamentId: number, round: number) {
    return useQuery({
        queryKey: tournamentKeys.roundGames(tournamentId, round),
        queryFn: () => tournamentApi.getRoundGames(tournamentId, round),
        enabled: !!tournamentId && tournamentId > 0 && round > 0,
        staleTime: 10 * 1000, // 10 seconds
    });
}

/**
 * ✅ Get user's current match
 */
export function useUserMatch(tournamentId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['tournament', tournamentId, 'user-match'],
        queryFn: () => tournamentApi.getUserMatch(tournamentId),
        enabled: enabled && !!tournamentId && tournamentId > 0,
        staleTime: 3000, // 3 seconds
        refetchInterval: 5000, // Poll every 5 seconds
        retry: 1, // Only retry once on failure
    });
}
