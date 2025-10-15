export type GameMode = 'ai' | 'local' | 'remote' | 'tournament' | 'multiplayer';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';
export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';
export type TournamentPlayerStatus = 'active' | 'eliminated' | 'winner';

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
    joined_at: string;
}

export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';

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

export interface TournamentGame {
    id: number;
    tournament_id: number;
    game_id: number;
    round: number;
    match_order: number;
    created_at: string;
}

export interface BracketMatch {
    tournamentGameId: number;
    gameId: number;
    round: number;
    matchOrder: number;
    status: string;
    leftPlayer?: {
        user_id: number | null;
        alias?: string | null;
        position: number;
        score: number;
    };
    rightPlayer?: {
        user_id: number | null;
        alias?: string | null;
        position: number;
        score: number;
    };
    winner_user_id?: number | null;
}

export interface TournamentBracket {
    tournament: Tournament;
    rounds: {
        round: number;
        matches: BracketMatch[];
    }[];
}
