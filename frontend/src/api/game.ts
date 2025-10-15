import api from './api';

export type GameMode = 'ai' | 'local' | 'remote' | 'tournament' | 'multiplayer';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';
export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';

export interface Game {
    id: number;
    mode: GameMode;
    status: GameStatus;
    winner_id: number | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}
export interface GamePlayer {
    id: number;
    game_id: number;
    user_id: number | null;
    position: number;
    score: number;
    is_ai: boolean;
    joined_at: string;
}


export interface Tournament {
    id: number;
    name: string;
    status: TournamentStatus;
    winner_id: number | null;
    max_players: number;
    current_round: number;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface TournamentPlayer {
    id: number;
    tournament_id: number;
    user_id: number;
    alias: string;
    status: 'active' | 'eliminated' | 'winner';
    registered_at: string;
}

export interface BracketPlayer {
    user_id: number | null;
    alias: string | null;
    position: number;
    score: number;
}
export interface BracketMatch {
    game_id: number;
    match_order: number;
    round: number;
    status: string;
    winner_user_id: number | null;
    players: BracketPlayer[];
}
export interface TournamentBracketDTO {
    tournament: Tournament;
    rounds: { round: number; matches: BracketMatch[] }[];
}


export const gameApi = {
    async createGame(mode: GameMode, players: { user_id: number | null; position: number }[]) {
        const { data } = await api.post<{ game: Game; players: GamePlayer[] }>('/games', { mode, players });
        return data;
    },
    async startGame(gameId: number) {
        // Use POST, not PATCH, and endpoint is /games/start
        const { data } = await api.post<{ game: Game }>('/games/start', { game_id: gameId });
        return data;
    },
    // Accept userId or position; local games use position
    async updateScore(payload: { gameId: number; score: number; userId?: number; position?: number }) {
        const body: Record<string, any> = { game_id: payload.gameId, score: payload.score };
        if (typeof payload.userId === 'number') body.user_id = payload.userId;
        if (typeof payload.position === 'number') body.position = payload.position;
        const { data } = await api.post<{ success: boolean }>('/games/score', body);
        return data;
    },
    async finishGame(gameId: number, winnerId?: number | null) {
        const { data } = await api.patch<{ game: Game }>(`/games/${gameId}/finish`, {
            winner_id: winnerId ?? null,
        });
        return data;
    },

    async cancelGame(gameId: number) {
        const { data } = await api.post<{ game: Game }>('/games/cancel', { game_id: gameId });
        return data;
    },

    // Create a new tournament
    createTournament: async (name: string, maxPlayers?: number) => {
        const { data } = await api.post<{ tournament: Tournament }>('/tournaments', { name, max_players: maxPlayers });
        return data.tournament;
    },
    listTournaments: async () => {
        const { data } = await api.get<{ tournaments: Tournament[] }>('/tournaments');
        return data.tournaments;
    },
    registerPlayer: async (tournamentId: number, userId: number, alias: string) => {
        const { data } = await api.post(`/tournaments/${tournamentId}/register`, { user_id: userId, alias });
        return data;
    },
    listPlayers: async (tournamentId: number) => {
        const { data } = await api.get<{ players: TournamentPlayer[] }>(`/tournaments/${tournamentId}/players`);
        return data.players;
    },
    // New: fetch bracket
    getBracket: async (tournamentId: number) => {
        const { data } = await api.get<TournamentBracketDTO>(`/tournaments/${tournamentId}/bracket`);
        return data;
    },

    async getTournamentBracket(tournamentId: number) {
        const { data } = await api.get<TournamentBracketDTO>(`/tournaments/${tournamentId}/bracket`);
        return data;
    },
    // Optional: manual start
    startTournament: async (tournamentId: number) => {
        const { data } = await api.post<{ tournament: Tournament }>(`/tournaments/${tournamentId}/start`, {});
        return data.tournament;
    },
};
