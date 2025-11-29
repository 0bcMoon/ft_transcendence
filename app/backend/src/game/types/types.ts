import type { WebSocket } from "ws";

export interface Player {
    id: number;
    username: string;
    avatar: string;
    socket: WebSocket | null;
    mode?: GameMode;
    gameId?: number;

}

export type Side = "left" | "right";
export type GameMode = "remote" | "ai" | "tournament" | "local";

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
        radius: number
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


export interface Match {
    gameId: number;
    Players: {
        left: Player | null;
        right: Player | null;
    };
    ready: {
        left: boolean;
        right: boolean;
    };
    state: GameState;
    startTime: number;
    loop?: ReturnType<typeof setInterval>;
    mode: GameMode;
}

export type ClientMessage =
    | { type: "joinGame"; username: string; avatar: string; mode: GameMode; gameId?: number }
    | { type: "ready" }
    | { type: "move"; up?: boolean; down?: boolean, left?: boolean, right: boolean }
    | { type: "playAgain"; mode: GameMode }
    | { type: "leaveGame" };

export interface TournamentMatch extends Match {
    bracketId: number;
    round: number;
}
