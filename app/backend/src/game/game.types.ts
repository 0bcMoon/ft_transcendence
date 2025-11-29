import type { WebSocket } from 'ws';

export type Side = "left" | "right";

export type GameMode = "remote" | "ai" | "tournament";


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

export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
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


export interface Player {
    id: number;       // The authenticated user ID
    username: string;
    avatar: string;
    socket: WebSocket | null; // Server-side WebSocket
    mode?: GameMode;
    gameId?: number;  // The ID of the match they are in
}

export interface Match {
    gameId: number;
    mode: GameMode;
    players: {
        left?: Player;
        right?: Player;
    };
    ready: {
        left: boolean;
        right: boolean;
    };
    state: GameState;
    startTime: number;
    loop?: NodeJS.Timeout; // Server-side interval ID type
}


/** Defines keys pressed in a LOCAL game (one keyboard, two players). */
export interface KeysPressed {
    w: boolean;
    s: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
}

/** Represents the return value of the useLocalGame hook. */
export interface LocalGame {
    countdown: number | null;
    isGameOver: boolean;
    winner: Side | null;
    finalScore: Scores | null;
    handlePlayAgain: () => void;
    playerNames: PlayerNames;
}

/** Represents the return value of the useRemoteGame (GameSession) hook. */
export interface GameSession {
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

export type ClientMessage =
    | { type: "joinGame"; username: string; avatar: string; mode: GameMode; gameId?: number; }
    | { type: "ready" }
    | { type: "move"; up: boolean; down: boolean }
    | { type: "playAgain"; mode: GameMode }
    | { type: "leaveGame" };

export type ServerMessage =
    | { type: "matchFound"; mode: GameMode; side: Side; playerNames: PlayerNames; playerAvatars: PlayerAvatars; id: string; }
    | { type: "state"; state: GameState }
    | { type: "gameOver"; winner: Side; score: Scores }
    | { type: "leaveGame" };
