export type GameMode = "1v1" | "ai" | "tournament" | "local";
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';
export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';


export type Side = "left" | "right";

export interface RecentMatch {
    id: number
    mode: string
    player1_id: number
    player1_username: string
    player1_profile_picture: string;
    player1_score: number
    player2_id: number
    player2_username: string
    player2_profile_picture: string;
    player2_score: number
}

export interface Champion {
    id: number;
    username: string;
    profile_picture: string;
}

// types/types.ts

export interface PlayerStats {
    user_id: number;
    level: number;
    total_xp: number;
    wins:  number;
    losses: number;
    games_played: number;
    win_rate: number;
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

export interface BracketPlayer {
    id: number;
    username: string;
    seed?: number;
}

// export interface BracketMatch {
//     id: number;
//     tournament_id: number;
//     round: number;
//     match_number: number;
//     status: string;
//     player1?: BracketPlayer;
//     player2?: BracketPlayer;
//     winner?: BracketPlayer;
//     game_id: number | null;
//     scheduled_at: string | null;
//     completed_at: string | null;
//     created_at: string;
// }

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


// ==================== REQUEST TYPES ====================

// export type UserMatchResponse = {
//     id: number;
//     round: number;
//     match_number: number;
//     status: 'pending' | 'playing' | 'completed';
//     player1: {
//         id: number;
//         user_id: number;
//         username: string;
//     };
//     player2: {
//         id: number;
//         user_id: number;
//         username: string;
//     };
//     game_id: number;
//     created_at: string;
// } | null;


// types/types.ts

export interface XPProgressPoint {
    total_xp: number;
    xp_gained: number;
    level: number;
    created_at: string;
}


export interface KeysPressed {
    w: boolean;
    s: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
}
export interface BracketPlayer {
    id: number;
    name: string;
}

export interface LeaderboardPlayer {
    user_id: number
    username: string
    display_name: string | null
    avatar: string | null
    elo_rating: number
    rank: "Bronze" | "Silver" | "Gold" | "Platinum" | "Master"
    wins: number
    losses: number
}


export interface TournamentData {
    id: string;
    name: string;
    players: BracketPlayer[];
    matches: BracketMatch[];
    status: string;
    maxPlayers: number;
}

export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Scores {
    left: number;
    right: number;
}

export interface PlayerNames {
    left: string;
    right: string;
}

export interface PlayerAvatars {
    left: string | null;
    right: string | null;
}

export interface Player {
    id: number;
    username: string;
    socket: WebSocket | null;
    mode?: GameMode;
    side?: Side; // Changed from 'position'
    avatar?: string;
}

export interface Match {
    game_id: number;
    players: {
        left?: Player;
        right?: Player;
    };
    state: GameState;
    ready: {
        left: boolean;
        right: boolean;
    };
    startTime: number;
    loop?: NodeJS.Timeout;
    mode: GameMode;
}
export interface GameState {
    ball: {
        x: number;
        y: number;
        speedX: number;
        speedY: number;
        radius: number;
    };
    leftPaddle: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    rightPaddle: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    score: {
        left: number;
        right: number;
    };
}



export interface LocalGame {
    gameStateRef: React.MutableRefObject<GameState | null>;
    countdown: number | null;
    isGameOver: boolean;
    winner: Side | null;
    finalScore: Scores | null;
    handlePlayAgain: () => void;
    playerNames: PlayerNames;
}

export interface GameSession {
    gameStateRef: React.MutableRefObject<GameState | null>;
    side: Side | null;
    countdown: number | null;
    isGameOver: boolean;
    winner: Side | null;
    waiting: boolean;
    playerNames: PlayerNames | null;
    playerAvatars: PlayerAvatars | null;
    finalScore: Scores | null;
    handlePlayAgain: () => void;
    handleGoHome: () => void;
}

export type ServerMessage =
    | {
        type: "matchFound";
        mode: GameMode;
        side: Side;
        playerNames: PlayerNames;
        playerAvatars: PlayerAvatars;
        id: string;
        round?: number;          
        matchNumber?: number;    
        tournamentId?: number;   
        matchId?: number;        
    }
    | {
        type: "tournamentInfo";
        round: number;
        matchNumber: number;
        tournamentId: number;
        matchId: number;
        side: Side;
    }
    | { type: "countdown"; count: number }
    | { type: "state"; state: GameState }
    | { type: "gameOver"; winner: Side; score: Scores }
    | { type: "opponentLeft" }            
    | { type: "leaveGame" }
    | { type: "error"; message: string };

// src/types/game.types.ts

export interface GlobalMatch {
    id: number;
    mode: 'remote' | 'tournament';
    player1_username: string;
    player1_profile_picture: string;
    player1_score: number;
    player2_username: string;
    player2_profile_picture: string;
    player2_score: number;
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

//--------------------------------------------

export interface MatchDetail {
    // Game Info
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
    player1_avatar: string;
    player1_score:  number;
    player1_xp_gained: number;
    
    // Player 2
    player2_id: number;
    player2_username: string;
    player2_avatar: string;
    player2_score: number;
    player2_xp_gained: number;
}

export interface GamePlayerDetail {
    position: number;
    user_id: number | null;
    username: string | null;
    display_name: string | null;
    avatar: string | null;
    score: number | null;
    elo_change: number | null;
    new_elo: number | null;
    result: string | null;
}


export interface CreateMatch {
    mode: string;
    players: { user_id: number; position: number; }[];

}

// types/tournament.ts

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
    success?: boolean;
}

export interface TournamentList {
    id: number;
    name: string;
    start_time: string;
    max_players: number;
    status: string;
    created_at: string;
}

export interface TournamentBasic {
    id: number;
    name: string;
    status: 'registration' | 'active' | 'finished' | 'cancelled';
    is_registered: boolean;
}

export interface TournamentPlayer {
    id: number;
    user_id: number;
    registered_at: string;
    username: string;
    profile_picture: string;
}

export interface BracketMatch {
  id: number;
  round: number;
  matchNumber: number;
  player1Username: string | null;
  player2Username: string | null;
  winnerUsername: string | null;
  gameId: number | null;
  status: "pending" | "playing" | "completed";
}

export interface TournamentCreator {
    id: number;
    username: string;
    avatar_url?: string;
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

export interface TournamentPlayer {
    id: number;
    tournament_id: number;
    user_id: number;
    seed: number;
    eliminated: number;
    registered_at: string;
    username: string;
    avatar: string;
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


export interface TopPlayer {
    id: number
    username: string
    profile_picture: string;
    total_xp: number
    badge_name?: string | null
    badge_icon?: string | null
}

