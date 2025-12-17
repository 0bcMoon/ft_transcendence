// types/tournament.types.ts

export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';

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

export interface CreateTournamentData {
    name: string;
    created_by: number;
    max_players: number;
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

export type TournamentMatchWithPlayers = TournamentMatch & {
    player1_user_id?: number;
    player1_username?: string;
    player2_user_id?: number;
    player2_username?: string;
};

export interface BracketRound {
    round: number;
    name: string;
    matches: BracketMatch[];
}

export interface Bracket {
    rounds: BracketRound[];
    champion?: {
        id: number;
        username: string;
    };
}

// Request params types
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
