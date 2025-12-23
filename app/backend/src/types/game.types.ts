// types/game.types.ts

export type GameMode = 'local' | 'remote' | 'ai' | 'tournament';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';

export interface RecentMatch {
    game_id: number;
    mode: GameMode;
    winner_id: number | null;
    ended_at: string | null;
    created_at: string;
    player1_score: number;
    player1_name: string;
    player1_avatar: string | null;
    player2_score: number;
    player2_name: string;
    player2_avatar: string | null;
}


export interface GameDetail {
    id: number;
    mode: string;
    status: string;
    winner_id: number | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface GamePlayerDetail {
    position: number;
    user_id: number | null;
    username: string | null;
    display_name: string | null;
    profile_picture: string | null;
    image_src: string | null;
    score: number | null;
    is_ai: boolean;
    joined_at: string;
    elo_change: number | null;
    new_elo: number | null;
    result: string | null;
}

export type EloProgressPoint = {
    new_elo: number;
    created_at: string;
};
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

export interface GamePlayerWithUser extends GamePlayer {
    username?: string;
    avatar?: string;
    profile_picture?: string;
}

export interface GameWithPlayers extends Game {
    players: GamePlayerWithUser[];
}

export interface CreateGameOptions {
    mode: GameMode;
}

export interface PlayerData {
    user_id: number | null;
    position: number;
    is_ai?: boolean;
}

export interface UserStats {
    wins: number;
    losses: number;
    winRate: number;
    score: number;
    rank: number | null;
}

export interface ScoreProgressionPoint {
    matchId: number;
    date: string;
    score: number;
}

export interface MatchHistoryItem {
    matchId: number;
    mode: GameMode;
    date: string;
    isWin: number;
    user_score: number;
    opponent_score: number;
    opponent_name: string | null;
    opponent_avatar: string | null;
}

// Request body types
export interface CreateGameBody {
    mode: GameMode;
    players: PlayerData[];
}

export interface StartGameBody {
    game_id: number;
}

export interface UpdatePlayerScoreBody {
    game_id: number;
    position: number;
    score: number;
}

export interface FinishGameBody {
    winner_id?: number;
}

export interface CancelGameBody {
    game_id: number;
}

// Request params types
export interface GameIdParams {
    id: string;
}

export interface GameIdParamsAlt {
    game_id: string;
}

export interface UserIdParams {
    user_id: string;
}

// Query string types
export interface LimitQuery {
    limit?: string;
}

export interface GamesByStatusQuery {
    status: GameStatus;
    mode?: GameMode;
}
