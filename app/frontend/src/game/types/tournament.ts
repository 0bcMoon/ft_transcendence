// types/tournament.ts
export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';

export interface Tournament {
    id: number;
    name: string;
    status: TournamentStatus;
    created_by: number;
    winner_id?: number;
    max_players: number;
    current_round: number;
    started_at?: string;
    ended_at?: string;
    created_at: string;
}

export interface TournamentPlayer {
    id: number;
    tournament_id: number;
    user_id: number;
    seed: number;
    eliminated: boolean;
    registered_at: string;
    username: string;
    avatar_url?: string;
    profile_picture?: string;
}

export interface TournamentCreator {
    id: number;
    username: string;
    avatar_url?: string;
}

export interface TournamentDetails extends Tournament {
    creator: TournamentCreator;
    players: TournamentPlayer[];
    player_count: number;
    is_registered: boolean;
    can_start: boolean;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface TournamentResponse {
    success: boolean;
    tournament: Tournament;
}

export interface TournamentDetailsResponse {
    success: boolean;
    tournament: TournamentDetails;
}

export interface TournamentsListResponse {
    success: boolean;
    tournaments: Tournament[];
}

export interface PlayersListResponse {
    success: boolean;
    players: TournamentPlayer[];
}
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
