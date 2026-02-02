// types/tournament.types.ts

export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';

export interface Tournament {
    id: number;
    name: string;
    status: 'registration' | 'active' | 'finished' | 'cancelled';
    created_by: number;
    winner_id: number | null;
    max_players: number;
    current_round: number;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface Champion {
    id: number;
    username: string;
    profile_picture: string | null;
}

export interface TournamentList {
    id: number;
    name: string;
    start_time: string;
    max_players: number;
    status: string;
    created_at: string;
}

export interface TournamentOverview {
    id: number;
    name: string;
    status: 'registration' | 'active' | 'finished' | 'cancelled';
    created_by: number;              // Keep as number
    creator_username?: string;        // Add this
    winner_id: number | null;
    winner_username?: string | null;
    winner_display_name?: string | null;
    max_players: number;
    current_round: number;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface TournamentBasic {
    id: number;
    name: string;
    status: 'registration' | 'active' | 'finished' | 'cancelled';
    is_registered: boolean;
}

export interface AvailableTournament {
    id: number;
    name: string;
    status: string;
    created_by: number;
    winner_id: number | null;
    max_players: number;
    current_round: number;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
    creator_username: string;
    player_count: number;
    is_registered: boolean;
}

export interface TournamentPlayer {
    id: number;
    user_id: number;
    registered_at: string;
    username: string;
    avatar: string;
}

export interface UserMatch {
    id: number;
    round: number;
    match_number: number;
    status: string;
}

export type TournamentMatch = {
    id: number;
    tournament_id: number;
    round: number;
    match_number: number;
    player1_id: number | null;
    player2_id: number | null;
    winner_id: number | null;
    game_id: number | null;
    status: 'pending' | 'playing' | 'completed';
    scheduled_at: string | null;
    completed_at: string | null;
    created_at: string;
};


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

export interface BracketPlayer {
    id: number;
    username: string;
    seed?: number;
}


export interface BracketMatch {
    id: number;
    round: number;
    matchNumber: number;
    player1Username: string;
    player2Username: string;
    winnerUsername: string;
    gameId: number;
    status: "pending" | "playing" | "completed";
}

export interface TournamentIdParams {
    id: string;
}

export interface RoundParams {
    id: string;
    round: string;
}

// Zod schema output type
export interface CreateTournamentInput {
    name: string;
    max_players: number;
}
