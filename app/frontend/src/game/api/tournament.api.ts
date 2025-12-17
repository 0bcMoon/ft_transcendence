// src/game/api/tournament.api.ts

import api from '@/api/api';
import {
    Tournament,
    TournamentDetails,
    TournamentPlayer,
    TournamentResponse,
    TournamentDetailsResponse,
    TournamentsListResponse,
    PlayersListResponse,
    UserMatchResponse,
} from '../types/tournament';

export const tournamentApi = {
    /**
     * Get all tournaments
     */
    async getAll(): Promise<Tournament[]> {
        const { data } = await api.get<TournamentsListResponse>('/api/tournaments');
        return data.tournaments;
    },

    /**
     * Get tournament by ID with full details
     */
    async getById(id: number): Promise<TournamentDetails> {
        const { data } = await api.get<TournamentDetailsResponse>(`/api/tournaments/${id}`);
        return data.tournament;
    },

    /**
     * Create a new tournament
     */
    async create(name: string, maxPlayers: number): Promise<Tournament> {
        const { data } = await api.post<TournamentResponse>('/api/tournaments', {
            name,
            max_players: maxPlayers,
        });
        return data.tournament;
    },

    /**
     * Register current user to tournament
     */
    async register(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/register`);
    },

    /**
     * Get tournament players
     */
    async getPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const { data } = await api.get<PlayersListResponse>(
            `/api/tournaments/${tournamentId}/players`
        );
        return data.players;
    },

    /**
     * Start tournament (creator only)
     */
    async start(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/start`);
    },

    /**
     * Cancel tournament (creator only)
     */
    async cancel(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/cancel`);
    },

    /**
     * Get tournament bracket
     */
    async getBracket(tournamentId: number): Promise<any> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/bracket`);
        return data.bracket;
    },

    /**
     * Advance to next round (creator only)
     */
    async advanceRound(tournamentId: number): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/advance`);
    },

    /**
     * Get tournament games
     */
    async getGames(tournamentId: number): Promise<any[]> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/games`);
        return data.games;
    },

    /**
     * Get games for specific round
     */
    async getRoundGames(tournamentId: number, round: number): Promise<any[]> {
        const { data } = await api.get(
            `/api/tournaments/${tournamentId}/rounds/${round}/games`
        );
        return data.games;
    },

    /**
     * ✅ Get user's current match in a tournament
     */
    async getUserMatch(tournamentId: number): Promise<UserMatchResponse> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/my-match`);
        return data.match; // Returns null if no match found
    },
};
