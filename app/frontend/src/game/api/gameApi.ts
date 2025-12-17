
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

export type EloProgressPoint = {
    new_elo: number;
    created_at: string; // ISO date
};



// ==================== GAME API ====================

export const gameApi = {
    async getRecentGlobalMatches(limit: number = 10): Promise<GlobalMatchData[]> {
        const { data } = await api.get<GlobalMatchData[]>(`/api/games/recent?limit=${limit}`);
        return Array.isArray(data) ? data : [];
    },

    async getUserEloProgression(userId: number, limit: number = 30): Promise<EloProgressPoint[]> {
        console.log("Fetching ELO progression for userId:", userId, "with limit:", limit);
        const { data } = await api.get<EloProgressPoint[]>(
            `/api/users/${userId}/elo-progression?limit=${limit}`
        );
        return Array.isArray(data) ? data : [];
    },

    async getUserStats(userId: number): Promise<UserStats> {
        const { data } = await api.get<UserStats>(`/api/users/${userId}/stats`);
        return data;
    },

    async getUserScoreProgression(userId: number, limit: number = 10): Promise<ScoreProgressionPoint[]> {
        const { data } = await api.get<ScoreProgressionPoint[]>(
            `/api/users/${userId}/score-progression?limit=${limit}`
        );
        return Array.isArray(data) ? data : [];
    },

    async getMatchHistory(userId: number): Promise<MatchHistoryItem[]> {
        const { data } = await api.get<MatchHistoryItem[]>(`/api/users/${userId}/match-history`);
        return Array.isArray(data) ? data : [];
    },

    async createGame(mode: GameMode, players: PlayerInput[]): Promise<{ game: Game; players: GamePlayer[] }> {
        const { data } = await api.post<{ game: Game; players: GamePlayer[] }>('/api/games', {
            mode,
            players
        });
        return data;
    },

    async startGame(gameId: number): Promise<{ game: Game }> {
        const { data } = await api.post<{ game: Game }>('/api/games/start', {
            game_id: gameId
        });
        return data;
    },

    async updateScore(payload: UpdateScoreInput): Promise<{ success: boolean }> {
        const { data } = await api.post<{ success: boolean }>('/api/games/score', {
            game_id: payload.gameId,
            position: payload.position,
            score: payload.score,
        });
        return data;
    },

    async finishGame(gameId: number, winnerId: number | null): Promise<{ game: Game }> {
        const { data } = await api.patch<{ game: Game }>(`/api/games/${gameId}/finish`, {
            winner_id: winnerId,
        });
        return data;
    },

    async cancelGame(gameId: number): Promise<{ game: Game }> {
        const { data } = await api.post<{ game: Game }>('/api/games/cancel', {
            game_id: gameId
        });
        return data;
    },

    async getGameDetails(gameId: number): Promise<GameWithPlayers> {
        const { data } = await api.get<GameWithPlayers>(`/api/games/${gameId}`);
        return data;
    },

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
    async createTournament(name: string, maxPlayers: number = 8): Promise<Tournament> {
        const { data } = await api.post<{ success: boolean; tournament: Tournament }>('/api/tournaments', {
            name,
            max_players: maxPlayers
        });
        return data.tournament;
    },

    async getTournament(tournamentId: number): Promise<TournamentDetails> {
        const { data } = await api.get<{ success: boolean; tournament: TournamentDetails }>(
            `/api/tournaments/${tournamentId}`
        );
        return data.tournament;
    },

    async listTournaments(): Promise<Tournament[]> {
        const { data } = await api.get<{ success: boolean; tournaments: Tournament[] }>('/api/tournaments');
        return data.tournaments;
    },

    async registerPlayer(tournamentId: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.post<{ success: boolean; message: string }>(
            `/api/tournaments/${tournamentId}/register`,
            {}
        );
        return data;
    },

    async listPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const { data } = await api.get<{ success: boolean; players: TournamentPlayer[] }>(
            `/api/tournaments/${tournamentId}/players`
        );
        return data.players;
    },
    async startTournament(tournamentId: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.post<{ success: boolean; message: string }>(
            `/api/tournaments/${tournamentId}/start`,
            {}
        );
        return data;
    },

    async getBracket(tournamentId: number): Promise<BracketData> {
        const { data } = await api.get<{ success: boolean; bracket: BracketData }>(
            `/api/tournaments/${tournamentId}/bracket`
        );
        return data.bracket;
    },

    async getTournamentGames(tournamentId: number): Promise<any[]> {
        const { data } = await api.get<{ success: boolean; games: any[] }>(
            `/api/tournaments/${tournamentId}/games`
        );
        return data.games;
    },

    async getRoundGames(tournamentId: number, round: number): Promise<any[]> {
        const { data } = await api.get<{ success: boolean; round: number; round_name: string; games: any[] }>(
            `/api/tournaments/${tournamentId}/rounds/${round}/games`
        );
        return data.games;
    },

    async cancelTournament(tournamentId: number): Promise<{ success: boolean; message: string }> {
        const { data } = await api.post<{ success: boolean; message: string }>(
            `/api/tournaments/${tournamentId}/cancel`,
            {}
        );
        return data;
    },
};

export default gameApi;
