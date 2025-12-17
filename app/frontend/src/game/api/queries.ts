import { useQuery } from '@tanstack/react-query';
import { GameMode } from '../types/types';
import { Tournament, TournamentPlayer } from '../api/gameApi';
import type { GlobalMatchData, UserStats, ScoreProgressionPoint } from '../types/types';
import { tournamentApi, gameApi, GameWithPlayers, RecentMatch, EloProgressPoint } from '../api/gameApi';

export interface MatchHistoryItem {
    matchId: number;
    mode: GameMode;
    date: string;
    isWin: number;
    user_score: number;
    opponent_score: number;
    opponent_name: string | null;
    opponent_avatar: string | null;
}


export type TopPlayer = {
    user_id: number;
    username: string;
    display_name: string;
    avatar: string | null;
    elo_rating: number;
    rank: string;
    wins: number;
    losses: number;
};

export const qk = {
    tournaments: ['tournaments'],
    tournament: (id: number) => ['tournament', id],
    tournamentPlayers: (id: number) => ['tournamentPlayers', id],
    tournamentGames: (id: number) => ['tournamentGames', id],
    tournamentRoundGames: (id: number, round: number) => ['tournamentRoundGames', id, round],
    tournamentBracket: (id: number) => ['tournamentBracket', id],
    recentMatches: (userId: number, limit: number) => ['recentMatches', userId, limit],
};

// ==================== TOURNAMENT QUERIES ============================

export const useListTournaments = () => {
    return useQuery<Tournament[], Error>({
        queryKey: qk.tournaments,
        queryFn: tournamentApi.listTournaments,
    });
};


export const useGetTopPlayers = (limit: number = 10) => {
    return useQuery<TopPlayer[], Error>({
        queryKey: ['top-players', limit],
        queryFn: () => gameApi.getTopPlayers(limit),
        enabled: limit > 0,
    });
};

export const useGetUserStats = (userId: number) => {
    return useQuery<UserStats, Error>({
        queryKey: ['user-stats', userId],
        queryFn: () => gameApi.getUserStats(userId),
        enabled: !!userId,
    });
};

export const useGetUserEloProgression = (userId: number, limit: number = 30) => {
    return useQuery<EloProgressPoint[], Error>({
        queryKey: ['user-elo-progression', userId, limit],
        queryFn: () => gameApi.getUserEloProgression(userId, limit),
        enabled: !!userId && limit > 0,
    });
};

export const useGetScoreProgression = (userId: number, limit: number = 10) => {
    return useQuery<ScoreProgressionPoint[], Error>({
        queryKey: ['score-progression', userId, limit],
        queryFn: () => gameApi.getUserScoreProgression(userId, limit),
        enabled: !!userId,
    });
};


export const useGetTournament = (tournamentId: number) => {
    return useQuery<Tournament, Error>({
        queryKey: qk.tournament(tournamentId),
        queryFn: () => tournamentApi.getTournament(tournamentId),
        enabled: !!tournamentId,
    });
};

export const useGetRecentMatches = (userId: number, limit: number = 10) => {
    return useQuery<RecentMatch[], Error>({
        queryKey: qk.recentMatches(userId, limit),
        queryFn: () => gameApi.getUserRecentMatches(userId, limit),
        enabled: !!userId,
    });
};

export const useGetGlobalMatches = (limit: number = 10) => {
    return useQuery<GlobalMatchData[], Error>({
        queryKey: ['global-matches', limit],
        queryFn: () => gameApi.getRecentGlobalMatches(limit),
        staleTime: 30000,
        refetchInterval: 60000,
    });
};

export const useUserScoreProgression = (userId?: number, limit = 10) =>
    useQuery({
        queryKey: ['userScoreProgression', userId, limit],
        queryFn: () => {
            if (!userId) throw new Error('No user ID');
            return gameApi.getUserScoreProgression(userId, limit);
        },
        enabled: !!userId,
    });

export const useListPlayers = (tournamentId: number) => {
    return useQuery<TournamentPlayer[], Error>({
        queryKey: qk.tournamentPlayers(tournamentId),
        queryFn: () => tournamentApi.listPlayers(tournamentId),
        enabled: !!tournamentId,
    });
};

export const useGetTournamentGames = (tournamentId: number) => {
    return useQuery<Tournament[], Error>({
        queryKey: qk.tournamentGames(tournamentId),
        queryFn: () => tournamentApi.getTournamentGames(tournamentId),
        enabled: !!tournamentId,
    });
};

export const useGetRoundGames = (tournamentId: number, round: number) => {
    return useQuery<Tournament[], Error>({
        queryKey: qk.tournamentRoundGames(tournamentId, round),
        queryFn: () => tournamentApi.getRoundGames(tournamentId, round),
        enabled: !!tournamentId && !!round, // Won't run if round is 0
    });
};

export const useGetMatchHistory = (userId: number) => {
    return useQuery<MatchHistoryItem[], Error>({
        queryKey: ['matchHistory', userId],
        queryFn: () => gameApi.getMatchHistory(userId),
        enabled: !!userId,
    });

};

export const useGetGameDetails = (gameId: number) => {
    return useQuery<GameWithPlayers | null, Error>({
        queryKey: ['gameDetails', gameId],
        queryFn: () => gameApi.getGameDetails(gameId),
        enabled: !!gameId,
    });
};
