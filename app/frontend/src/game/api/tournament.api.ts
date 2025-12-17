import api from '@/api/api';
import {
    Tournament,
    TournamentDetails,
    TournamentPlayer,
    TournamentResponse,
    TournamentDetailsResponse,
    TournamentsListResponse,
    PlayersListResponse,
} from '../types/tournament';

export const tournamentApi = {

    async getAll(): Promise<Tournament[]> {
        const { data } = await api.get<TournamentsListResponse>('/api/tournaments');
        return data.tournaments;
    },

    async getById(id: number): Promise<TournamentDetails> {
        const { data } = await api.get<TournamentDetailsResponse>(`/api/tournaments/${id}`);
        return data.tournament;
    },

    async create(name: string, maxPlayers: number): Promise<Tournament> {
        const { data } = await api.post<TournamentResponse>('/api/tournaments', {
            name,
            max_players: maxPlayers,
        });
        return data.tournament;
    },

    async register(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/register`);
    },

    async getPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const { data } = await api.get<PlayersListResponse>(
            `/api/tournaments/${tournamentId}/players`
        );
        return data.players;
    },

    async start(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/start`);
    },

    async cancel(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/cancel`);
    },

    async getBracket(tournamentId: number): Promise<any> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/bracket`) as any;
        return data.bracket;
    },

    async advanceRound(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/advance`);
    },

    async getGames(tournamentId: number): Promise<any[]> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/games`) as any;
        return data.games;
    },

    async getRoundGames(tournamentId: number, round: number): Promise<any[]> {
        const { data } = await api.get(
            `/api/tournaments/${tournamentId}/rounds/${round}/games`
        ) as any;
        return data.games;
    },

    async getUserMatch(tournamentId: number): Promise<any> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/my-match`) as any;
        return data.match;
    },
};
