import type { WebSocket } from 'ws';

export type Side = "left" | "right";

export type GameMode = "remote"| "tournament";

export interface Scores {
    left: number;
    right: number;
}

export interface TournamentMatch {
    gameId: number;
    players: { left: Player; right: Player };
    ready: { left: boolean; right: boolean };
    state: GameState;
    keys: {
        left: { up: boolean; down: boolean };
        right: { up: boolean; down: boolean };
    };
    loop?: NodeJS.Timeout;
    tournamentId: number;
    matchId: number;
}

export interface Match {
    gameId: number;
    players: { left: Player; right: Player };
    ready: { left: boolean; right: boolean };
    state: GameState;
    keys: { left: { up: boolean; down: boolean }; right: { up: boolean; down: boolean }; };
    loop?: NodeJS.Timeout;
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

export interface Ball {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    radius: number;
}

export interface Score {
    left: number;
    right: number;
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



export interface KeysPressed {
    w: boolean;
    s: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
}

export type ClientMessage = 
    | { type: 'remote'; username: string; avatar?: string }
    | { type: 'tournament'; username: string; avatar?: string; tournamentId: number; matchId: number }
    | { type: 'ready' }
    | { type: 'move'; up: boolean; down: boolean }
    | { type: 'playAgain' }
    | { type:  'leaveGame' };

