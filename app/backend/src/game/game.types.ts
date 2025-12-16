// game/game.types.ts

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
    id: number;
    username: string;
    avatar: string;
    socket: WebSocket | null;
    mode?: GameMode;
    gameId?: number;
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
    loop?: NodeJS.Timeout;
}

export interface KeysPressed {
    w: boolean;
    s: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
}

export interface LocalGame {
    countdown: number | null;
    isGameOver: boolean;
    winner: Side | null;
    finalScore: Scores | null;
    handlePlayAgain: () => void;
    playerNames: PlayerNames;
}

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

// ✅ Updated ClientMessage with tournament fields
export type ClientMessage =
    | {
        type: "joinGame";
        username: string;
        avatar: string;
        mode: GameMode;
        gameId?: number;          // For legacy tournament support
        tournamentId?: number;    // ✅ For tournament matches
        matchId?: number;         // ✅ For tournament matches
    }
    | { type: "ready" }
    | { type: "move"; up: boolean; down: boolean }
    | { type: "playAgain"; mode: GameMode }
    | { type: "leaveGame" };

// ✅ Updated ServerMessage with tournament fields and new message types
export type ServerMessage =
    | {
        type: "matchFound";
        mode: GameMode;
        side: Side;
        playerNames: PlayerNames;
        playerAvatars: PlayerAvatars;
        id: string;
        round?: number;           // ✅ For tournament matches
        matchNumber?: number;     // ✅ For tournament matches
        tournamentId?: number;    // ✅ For tournament matches
        matchId?: number;         // ✅ For tournament matches
    }
    | { type: "countdown"; count: number }  // ✅ Add countdown
    | { type: "state"; state: GameState }
    | { type: "gameOver"; winner: Side; score: Scores }
    | { type: "opponentLeft" }              // ✅ Add opponent left
    | { type: "leaveGame" }
    | { type: "error"; message: string };   // ✅ Add error message
