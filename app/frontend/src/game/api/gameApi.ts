// src/game/api/gameApi.ts

import api from '@/api/api';
import type {
    GlobalMatchData,
    UserStats,
    ScoreProgressionPoint,
    GameMode,
    MatchHistoryItem
} from '../types/types';

// ==================== ADDITIONAL TYPES ====================

export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';
export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';

export interface RecentMatch {
    id: number;                    // game id
    mode: 'remote' | 'tournament';
    winner_id: number | null;
    finished_at: string | null;
    player1_id: number;
    player1_score: number;
    player1_name: string;
    player1_avatar?: string | null;
    player2_id: number;
    player2_score: number;
    player2_name: string;
    player2_avatar?: string | null;
}

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
    is_ai: number;
    joined_at: string;
}

export interface GamePlayerDetails extends GamePlayer {
    username: string | null;
    avatar: string | null;
}

export interface GameWithPlayers extends Game {
    players: GamePlayerDetails[];
}

export interface Tournament {
    id: number;
    name: string;
    status: TournamentStatus;
    created_by: number;
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
    seed: number;
    eliminated: number;
    registered_at: string;
    username: string;
    profile_picture?: string;
}

export interface BracketPlayer {
    id: number;
    username: string;
    seed?: number;
}

export interface BracketMatch {
    id: number;
    tournament_id: number;
    round: number;
    match_number: number;
    status: string;
    player1?: BracketPlayer;
    player2?: BracketPlayer;
    winner?: BracketPlayer;
    game_id: number | null;
    scheduled_at: string | null;
    completed_at: string | null;
    created_at: string;
}

export interface BracketRound {
    round: number;
    name: string;
    matches: BracketMatch[];
}

export interface BracketData {
    rounds: BracketRound[];
    champion?: {
        id: number;
        username: string;
    };
}

export interface TournamentDetails extends Tournament {
    creator: {
        id: number;
        username: string;
    };
    players: TournamentPlayer[];
    player_count: number;
    is_registered: boolean;
    can_start: boolean;
}

// ==================== REQUEST TYPES ====================

type PlayerInput = {
    user_id: number | null;
    position: number;
};

type UpdateScoreInput = {
    gameId: number;
    position: number;
    score: number;
};

export type UserMatchResponse = {
    id: number;
    round: number;
    match_number: number;
    status: 'pending' | 'playing' | 'completed';
    player1: {
        id: number;
        user_id: number;
        username: string;
    };
    player2: {
        id: number;
        user_id: number;
        username: string;
    };
    game_id: number;
    created_at: string;
} | null;

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

// Export all types


// ==================== GAME API ====================

export const gameApi = {
    /**
     * Get recent global matches
     * GET /api/games/recent?limit=10
     */
    async getRecentGlobalMatches(limit: number = 10): Promise<GlobalMatchData[]> {
        const { data } = await api.get<GlobalMatchData[]>(`/api/games/recent?limit=${limit}`);
        return Array.isArray(data) ? data : [];
    },

    /**
     * Get user statistics
     * GET /api/users/: id/stats
     */
    async getUserStats(userId: number): Promise<UserStats> {
        const { data } = await api.get<UserStats>(`/api/users/${userId}/stats`);
        return data;
    },

    /**
     * Get user score progression
     * GET /api/users/:id/score-progression?limit=10
     */
    async getUserScoreProgression(userId: number, limit: number = 10): Promise<ScoreProgressionPoint[]> {
        const { data } = await api.get<ScoreProgressionPoint[]>(
            `/api/users/${userId}/score-progression?limit=${limit}`
        );
        return Array.isArray(data) ? data : [];
    },

    /**
     * Get user match history
     * GET /api/users/:id/match-history
     */
    async getMatchHistory(userId: number): Promise<MatchHistoryItem[]> {
        const { data } = await api.get<MatchHistoryItem[]>(`/api/users/${userId}/match-history`);
        return Array.isArray(data) ? data : [];
    },

    /**
     * Create a new game
     * POST /api/games
     */
    async createGame(mode: GameMode, players: PlayerInput[]): Promise<{ game: Game; players: GamePlayer[] }> {
        const { data } = await api.post<{ game: Game; players: GamePlayer[] }>('/api/games', {
            mode,
            players
        });
        return data;
    },

    /**
     * Start a game
     * POST /api/games/start
     */
    async startGame(gameId: number): Promise<{ game: Game }> {
        const { data } = await api.post<{ game: Game }>('/api/games/start', {
            game_id: gameId
        });
        return data;
    },

    /**
     * Update player score
     * POST /api/games/score
     */
    async updateScore(payload: UpdateScoreInput): Promise<{ success: boolean }> {
        const { data } = await api.post<{ success: boolean }>('/api/games/score', {
            game_id: payload.gameId,
            position: payload.position,
            score: payload.score,
        });
        return data;
    },

    /**
     * Finish a game
     * PATCH /api/games/:id/finish
     */
    async finishGame(gameId: number, winnerId: number | null): Promise<{ game: Game }> {
        const { data } = await api.patch<{ game: Game }>(`/api/games/${gameId}/finish`, {
            winner_id: winnerId,
        });
        return data;
    },

    /**
     * Cancel a game
     * POST /api/games/cancel
     */
    async cancelGame(gameId: number): Promise<{ game: Game }> {
        const { data } = await api.post<{ game: Game }>('/api/games/cancel', {
            game_id: gameId
        });
        return data;
    },

    /**
     * Get game details with players
     * GET /api/games/:id
     */
    async getGameDetails(gameId: number): Promise<GameWithPlayers> {
        const { data } = await api.get<GameWithPlayers>(`/api/games/${gameId}`);
        return data;
    },

    /**
     * Get games by status
     * GET /api/games? status=waiting&mode=remote
     */
    async getGamesByStatus(status: GameStatus, mode?: GameMode): Promise<{ games: Game[] }> {
        const params = new URLSearchParams({ status });
        if (mode) params.append('mode', mode);
        const { data } = await api.get<{ games: Game[] }>(`/api/games?${params.toString()}`);
        return data;
    },

    async getUserRecentMatches(userId: number, limit: number = 10): Promise<RecentMatch[]> {
        const { data } = await api.get<RecentMatch[]>(
            `/api/games/user/${userId}/recent?limit=${limit}`
        );
        return Array.isArray(data) ? data : [];
    },

    async getTopPlayers(limit: number = 10): Promise<TopPlayer[]> {
        const { data } = await api.get<TopPlayer[]>(`/api/players/top?limit=${limit}`);
        return Array.isArray(data) ? data : [];
    },
};

// ==================== TOURNAMENT API ====================

export const tournamentApi = {
    /**
     * Create a tournament
     * POST /api/tournaments
     */
    async createTournament(name: string, maxPlayers: number = 8): Promise<Tournament> {
        const { data } = await api.post<{ success: boolean; tournament: Tournament }>('/api/tournaments', {
            name,
            max_players: maxPlayers
        });
        return data.tournament;
    },

    /**
     * Get tournament details
     * GET /api/tournaments/:id
     */
    async getTournament(tournamentId: number): Promise<TournamentDetails> {
        const { data } = await api.get<{ success: boolean; tournament: TournamentDetails }>(
            `/api/tournaments/${tournamentId}`
        );
        return data.tournament;
    },

    /**
     * List all tournaments
     * GET /api/tournaments
     */
    async listTournaments(): Promise<Tournament[]> {
        const { data } = await api.get<{ success: boolean; tournaments: Tournament[] }>('/api/tournaments');
        return data.tournaments;
    },

    /**
     * Register player for tournament
     * POST /api/tournaments/:id/register
     */
    async registerPlayer(tournamentId: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.post<{ success: boolean; message: string }>(
            `/api/tournaments/${tournamentId}/register`,
            {}
        );
        return data;
    },

    /**
     * List tournament players
     * GET /api/tournaments/:id/players
     */
    async listPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const { data } = await api.get<{ success: boolean; players: TournamentPlayer[] }>(
            `/api/tournaments/${tournamentId}/players`
        );
        return data.players;
    },

    /**
     * Start tournament
     * POST /api/tournaments/:id/start
     */
    async startTournament(tournamentId: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.post<{ success: boolean; message: string }>(
            `/api/tournaments/${tournamentId}/start`,
            {}
        );
        return data;
    },

    /**
     * Get tournament bracket
     * GET /api/tournaments/:id/bracket
     */
    async getBracket(tournamentId: number): Promise<BracketData> {
        const { data } = await api.get<{ success: boolean; bracket: BracketData }>(
            `/api/tournaments/${tournamentId}/bracket`
        );
        return data.bracket;
    },

    /**
     * Get all tournament games
     * GET /api/tournaments/:id/games
     */
    async getTournamentGames(tournamentId: number): Promise<any[]> {
        const { data } = await api.get<{ success: boolean; games: any[] }>(
            `/api/tournaments/${tournamentId}/games`
        );
        return data.games;
    },

    /**
     * Get games for specific round
     * GET /api/tournaments/:id/rounds/:round/games
     */
    async getRoundGames(tournamentId: number, round: number): Promise<any[]> {
        const { data } = await api.get<{ success: boolean; round: number; round_name: string; games: any[] }>(
            `/api/tournaments/${tournamentId}/rounds/${round}/games`
        );
        return data.games;
    },

    /**
     * Cancel tournament
     * POST /api/tournaments/:id/cancel
     */
    async cancelTournament(tournamentId: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.post<{ success: boolean; message: string }>(
            `/api/tournaments/${tournamentId}/cancel`,
            {}
        );
        return data;
    },
    async getUserMatch(tournamentId: number): Promise<UserMatchResponse> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/my-match`);
        return data.match; // Returns null if no match found
    },
};

export default gameApi;
