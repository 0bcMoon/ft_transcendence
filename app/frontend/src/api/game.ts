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

export interface TournamentGame {
    id: number;
    tournament_id: number;
    game_id: number;
    round: number;
    match_order: number;
    created_at: string;
}

export const gameApi = {
    // ==================== GAME APIs ====================

    async createGame(mode: GameMode, players: { user_id: number | null; position: number }[]) {
        const { data } = await api.post<{ game: Game; players: GamePlayer[] }>('/api/games', { mode, players });
        return data;
    },

    async startGame(gameId: number) {
        const { data } = await api.post<{ game: Game }>('/api/games/start', { game_id: gameId });
        return data;
    },

    async updateScore(payload: { gameId: number; score: number; userId?: number; position?: number }) {
        const body: Record<string, any> = { game_id: payload.gameId, score: payload.score };
        if (typeof payload.userId === 'number') body.user_id = payload.userId;
        if (typeof payload.position === 'number') body.position = payload.position;
        const { data } = await api.post<{ success: boolean }>('/api/games/score', body);
        return data;
    },

    async finishGame(gameId: number, winnerId?: number | null) {
        const { data } = await api.patch<{ game: Game }>(`/api/games/${gameId}/finish`, {
            winner_id: winnerId ?? null,
        });
        return data;
    },

    async cancelGame(gameId: number) {
        const { data } = await api.post<{ game: Game }>('/api/games/cancel', { game_id: gameId });
        return data;
    },

    // ==================== TOURNAMENT APIs ====================

    /**
     * Create a new tournament
     * POST /api/tournaments
     */
    createTournament: async (name: string, maxPlayers: number = 8) => {
        const { data } = await api.post<{ tournament: Tournament }>('/api/tournaments', {
            name,
            max_players: maxPlayers
        });
        return data.tournament;
    },

    /**
     * Get tournament by ID
     * GET /api/tournaments/:id
     */
    getTournament: async (tournamentId: number) => {
        const { data } = await api.get<{ tournament: Tournament }>(`/api/tournaments/${tournamentId}`);
        return data.tournament;
    },

    /**
     * List all tournaments
     * GET /api/tournaments
     */
    listTournaments: async () => {
        const { data } = await api.get<{ tournaments: Tournament[] }>('/api/tournaments');
        return data.tournaments;
    },

    /**
     * Register a player to a tournament
     * POST /api/tournaments/:id/register
     */
    registerPlayer: async (tournamentId: number, userId: number, alias: string) => {
        const { data } = await api.post<{ registration_id: number; players: TournamentPlayer[] }>(
            `/api/tournaments/${tournamentId}/register`,
            { user_id: userId, alias }
        );
        return data;
    },

    /**
     * List players in a tournament
     * GET /api/tournaments/:id/players
     */
    listPlayers: async (tournamentId: number) => {
        const { data } = await api.get<{ players: TournamentPlayer[] }>(`/api/tournaments/${tournamentId}/players`);
        return data.players;
    },

    /**
     * Start tournament (creates Round 1 games)
     * POST /api/tournaments/:id/start
     */
    startTournament: async (tournamentId: number) => {
        const { data } = await api.post<{ tournament: Tournament }>(`/api/tournaments/${tournamentId}/start`, {});
        return data.tournament;
    },

    /**
     * Advance to next round after current round finishes
     * POST /api/tournaments/:id/advance
     */
    advanceRound: async (tournamentId: number) => {
        const { data } = await api.post<{ tournament: Tournament; message: string }>(
            `/api/tournaments/${tournamentId}/advance`,
            {}
        );
        return data;
    },

    /**
     * Get all games in a tournament
     * GET /api/tournaments/:id/games
     */
    getTournamentGames: async (tournamentId: number) => {
        const { data } = await api.get<{ games: TournamentGame[] }>(`/api/tournaments/${tournamentId}/games`);
        return data.games;
    },

    /**
     * Get games for a specific round
     * GET /api/tournaments/:id/rounds/:round/games
     */
    getRoundGames: async (tournamentId: number, round: number) => {
        const { data } = await api.get<{ games: TournamentGame[] }>(
            `/api/tournaments/${tournamentId}/rounds/${round}/games`
        );
        return data.games;
    },

    /**
     * Get full tournament bracket (for UI display)
     * GET /api/tournaments/:id/bracket
     */
    getBracket: async (tournamentId: number) => {
        const { data } = await api.get<TournamentBracketDTO>(`/api/tournaments/${tournamentId}/bracket`);
        return data;
    },

    /**
     * Get tournament bracket (alias for getBracket)
     * GET /api/tournaments/:id/bracket
     */
    getTournamentBracket: async (tournamentId: number) => {
        const { data } = await api.get<TournamentBracketDTO>(`/api/tournaments/${tournamentId}/bracket`);
        return data;
    },

    /**
     * Cancel a tournament
     * POST /api/tournaments/:id/cancel
     */
    cancelTournament: async (tournamentId: number) => {
        const { data } = await api.post<{ tournament: Tournament; message: string }>(
            `/api/tournaments/${tournamentId}/cancel`,
            {}
        );
        return data;
    },
};
