import api from '@/api/api';
import type {
    GlobalMatch,
    PlayerStats,
    MatchDetail,
    TournamentPlayer,
    TournamentOverview,
    XPProgressPoint,
    RecentMatch,
    TopPlayer,
    TournamentBasic,
    BracketMatch,
    Champion,
    TournamentList
} from '../types/types';


export const gameApi = {

    create: async (params: { name: string; maxPlayers: number; startTime: string }): Promise<void> => {
        await api.post('/api/tournaments', { name: params.name, max_players: params.maxPlayers, start_time: params.startTime });
    },


    getAll: async (): Promise<TournamentList[]> => {
        const { data } = await api.get<TournamentList[]>('/api/tournaments/list');
        return data;
    },

    getChampion: async (id: number): Promise<Champion> => {
        const { data } = await api.get<Champion>(`/api/tournaments/${id}/champion`);
        return data;
    },

    async getTopPlayers(limit: number = 6): Promise<TopPlayer[]> {
        const { data } = await api.get<TopPlayer[]>('/api/players/top', { params: { limit }, });
        return data;
    },

    register: async (tournamentId: number): Promise<void> => {
        await api.post(`/api/tournaments/${tournamentId}/register`);
    },

    getPlayers: async (tournamentId: number): Promise<TournamentPlayer[]> => {
        const { data } = await api.get<TournamentPlayer[]>(`/api/tournaments/${tournamentId}/players`);
        return data;
    },


    async getUserStats(userId: number): Promise<PlayerStats> {
        const { data } = await api.get<PlayerStats>(`/api/users/${userId}/stats`);
        return data;
    },

    async getGameDetail(gameId: number): Promise<MatchDetail> {
        const { data } = await api.get<MatchDetail>(`/api/games/${gameId}/detail`);
        return data;
    },

    async getXPProgress(userId: number, limit: number = 30): Promise<XPProgressPoint[]> {
        const { data } = await api.get<XPProgressPoint[]>(`/api/users/${userId}/xp-progress`, { params: { limit }, });
        return data;
    },

    async getGlobalMatches(page: number = 1, limit: number = 10): Promise<GlobalMatch[]> {
        const offset = (page - 1) * limit;
        const { data } = await api.get<GlobalMatch[]>('/api/games/recent', { params: { limit, offset } });
        return data;
    },

    async getUserMatches(userId: number, page: number = 1, limit: number = 10): Promise<RecentMatch[]> {
        const offset = (page - 1) * limit;
        const { data } = await api.get<RecentMatch[]>(`/api/games/${userId}/recent`, { params: { limit, offset }, });
        return data;
    },



    Overview: async (id: number): Promise<TournamentOverview> => {
        const { data } = await api.get<TournamentOverview>(`/api/tournaments/${id}/overview`);
        return data;
    },

    getTournamentBasic: async (id: number): Promise<TournamentBasic> => {
        const { data } = await api.get<TournamentBasic>(`/api/tournaments/${id}/name`);
        return data;
    },

    getBracket: async (tournamentId: number): Promise<BracketMatch[]> => {
        const { data } = await api.get<{ success: boolean; bracket: BracketMatch[] }>(
            `/api/tournaments/${tournamentId}/bracket`);
        return data.bracket ?? [];
    },

    getUserMatch: async (tournamentId: number): Promise<any> => {
        const { data } = await api.get<{ success: boolean; match: any }>(
            `/api/tournaments/${tournamentId}/user-match`);
        return data.match;
    },
};
