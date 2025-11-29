import { useQuery } from '@tanstack/react-query';
import { tournamentApi, gameApi, GameWithPlayers } from '../api/gameApi';
import { GameMode } from '../types/types';
import { Tournament, TournamentPlayer, TournamentGame } from '../api/gameApi';

export type UserStats = {
    wins: number;
    losses: number;
    winRate: number; // percent (0-100)
    score: number;   // wins*3 - losses
    rank: number | null;
};


import {
    BracketPlayer,
    BracketMatch,
    TournamentData,
    buildMatchesFromBracketData,
    fillTournamentSlots,
    buildEmptyMatches
} from '../utils/tournamentUtils';

export interface MatchHistoryItemData {
    matchId: number;
    mode: GameMode;
    date: string;       // This will be the 'ended_at' timestamp
    isWin: boolean;
    user_score: number;
    opponent_score: number;
    opponent_name: string | null; // Opponent's name (or null if AI/local)
    opponent_avatar: string | null; // Opponent's avatar (or null)
}

export const qk = {
    tournaments: ['tournaments'],
    tournament: (id: number) => ['tournament', id],
    tournamentPlayers: (id: number) => ['tournamentPlayers', id],
    tournamentGames: (id: number) => ['tournamentGames', id],
    tournamentRoundGames: (id: number, round: number) => ['tournamentRoundGames', id, round],
    tournamentBracket: (id: number) => ['tournamentBracket', id],
};

// ==================== TOURNAMENT QUERIES ============================

export const useListTournaments = () => {
    return useQuery<Tournament[], Error>({
        queryKey: qk.tournaments,
        queryFn: tournamentApi.listTournaments,
    });
};



// export const useListTournaments = (user_id: number | null) => {
//     // This query now expects the API to return the joined status
//     return useQuery<Tournament[], Error>({
//         queryKey: [qk.tournaments, user_id],
//         queryFn: () => tournamentApi.listTournaments(user_id),
//     });
// };

export const useGetTournament = (tournamentId: number) => {
    return useQuery<Tournament, Error>({
        queryKey: qk.tournament(tournamentId),
        queryFn: () => tournamentApi.getTournament(tournamentId),
        enabled: !!tournamentId,
    });
};

export const useGetGlobalMatches = (limit: number = 10) => {
    return useQuery({
        queryKey: ['globalMatches', limit],
        queryFn: () => gameApi.getRecentGlobalMatches(limit),
        enabled: true,
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
    return useQuery<TournamentGame[], Error>({
        queryKey: qk.tournamentGames(tournamentId),
        queryFn: () => tournamentApi.getTournamentGames(tournamentId),
        enabled: !!tournamentId,
    });
};

export const useGetRoundGames = (tournamentId: number, round: number) => {
    return useQuery<TournamentGame[], Error>({
        queryKey: qk.tournamentRoundGames(tournamentId, round),
        queryFn: () => tournamentApi.getRoundGames(tournamentId, round),
        enabled: !!tournamentId && !!round, // Won't run if round is 0
    });
};

export const useGetMatchHistory = (userId: number) => {
    return useQuery<MatchHistoryItemData[], Error>({
        queryKey: ['matchHistory', userId],
        queryFn: () => gameApi.getMatchHistory(userId),
        enabled: !!userId,
    });

};

export const useGetUserStats = (userId?: number) => {
    return useQuery<UserStats, Error>({
        queryKey: ['userStats', userId],
        queryFn: () => {
            if (!userId) throw new Error('No user ID provided');
            return gameApi.getUserStats(userId);
        },
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

export const useGetBracketData = (tournamentId: number) => {
    return useQuery<TournamentData | null, Error>({
        queryKey: qk.tournamentBracket(tournamentId),
        queryFn: async () => {
            if (!tournamentId)
                return null;

            // 1. Fetch data
            const [tournament, registered] = await Promise.all([
                tournamentApi.getTournament(tournamentId),
                tournamentApi.listPlayers(tournamentId),
            ]);

            if (!tournament)
                return null;

            let matches: BracketMatch[] = [];
            if (tournament.status === "active" || tournament.status === "finished") {
                try {
                    const bracketData = await tournamentApi.getBracket(tournamentId);
                    console.log("Fetched-----> bracket data:", bracketData);
                    matches = buildMatchesFromBracketData(bracketData);
                    console.log("Processed matches:", matches);
                } catch (err) {
                    console.error("Error fetching bracket data:", err);
                }
            }

            const regPlayers: BracketPlayer[] = registered
                .sort((a: TournamentPlayer, b: TournamentPlayer) => a.registered_at.localeCompare(b.registered_at))
                .map((p: TournamentPlayer) => ({ id: p.user_id, name: p.alias }));
            console.log("Registered players:", regPlayers);
            console.log("regestered", registered);

            const players = fillTournamentSlots(regPlayers, tournament.max_players);

            if (matches.length === 0) {
                matches = buildEmptyMatches(players);
            }

            return {
                id: String(tournament.id),
                name: tournament.name,
                players,
                matches,
                status: tournament.status,
                maxPlayers: tournament.max_players,
            };
        },
        enabled: !!tournamentId,
    });
};
