export type GameMode = "1v1" | "tournament";
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type TournamentStatus = 'registration' | 'active' | 'finished';


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

export interface GamePlayer {
    id: number;
    game_id: number;
    user_id: number | null;
    position: number;
    score: number;
    is_ai: number;
    joined_at: string;
}

export interface BracketPlayer {
    id: number;
    username: string;
    seed?: number;
}


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
    side?: Side;
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
    | { type: "leaveGame" }
    | { type: "error"; message: string };

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
    status: 'registration' | 'active' | 'finished';
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
    status: 'registration' | 'active' | 'finished';
    created_by: number;  
    creator_username?: string; 
    winner_id: number | null;
    winner_username?: string | null;
    winner_display_name?: string | null;
    max_players: number;
    current_round: number;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface TopPlayer {
    id: number
    username: string
    profile_picture: string;
    total_xp: number
    badge_name?: string | null
    badge_icon?: string | null
}

