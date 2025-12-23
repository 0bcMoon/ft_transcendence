export type GameMode = "1v1" | "ai" | "tournament" | "local";

export type Side = "left" | "right";

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

export interface BracketMatch {
    id: string;
    gameId: number;
    round: number;
    player1: BracketPlayer | null;
    player2: BracketPlayer | null;
    score1: number | null;
    score2: number | null;
    winner: BracketPlayer | null;
    status: string;
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

export interface GlobalMatchData {
    matchId: number;
    mode: GameMode;
    date: string;
    player1_name: string;
    player1_avatar: string | null;
    player1_score: number;
    player2_name: string;
    player2_avatar: string | null;
    player2_score: number;
    winner_id: number | null;
}

export interface UserStats {
    wins: number;
    losses: number;
    winRate: number;
    rank: string;
    leaderboardPosition: number;
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

