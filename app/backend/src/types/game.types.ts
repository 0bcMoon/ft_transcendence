export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';
export type GameMode = 'local' | 'remote' | 'tournament';

export interface RecentMatch {
    id: number
    mode: string
    player1_username: string
    player1_profile_picture: string;
    player1_score: number
    player2_username: string
    player2_profile_picture: string;
    player2_score: number
}

export interface GlobalMatch {
    id: number;
    mode: string;
    player1_username: string;
    player1_profile_picture: string;
    player1_score: number;
    player2_username: string;
    player2_profile_picture: string;
    player2_score: number;
}

export interface PlayerStats {
    user_id: number;
    level: number;
    total_xp: number;
    wins:  number;
    losses: number;
    games_played: number;
    win_rate: number;
}

export interface TopPlayer {
    id: number
    username: string
    profile_picture: string;
    total_xp: number
    badge_name?: string | null
    badge_icon?: string | null
}

export interface MatchDetail {
    id: number;
    mode: string;
    status: string;
    winner_id: number | null;
    started_at: string;
    ended_at: string | null;
    created_at: string;
    tournament_id?: number | null;
    
    // Player 1
    player1_id:  number;
    player1_username: string;
    player1_display_name: string;
    profile_picture: string;
    player1_score:  number;
    player1_xp_gained: number;
    
    // Player 2
    player2_id: number | null;
    player2_username: string | null;
    player2_display_name: string | null;
    player2_avatar: string | null;
    player2_score: number;
    player2_xp_gained: number;
}


export interface XPProgressPoint {
    total_xp: number;
    xp_gained: number;
    level: number;
    created_at: string;
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

