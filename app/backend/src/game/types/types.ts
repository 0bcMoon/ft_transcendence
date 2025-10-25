import type { WebSocket } from "ws";

export interface Player {
    id: number;
    username: string;
    avatar: string;
    socket: WebSocket | null;
    mode?: GameMode;
    gameId?: number;

}

export type Side = "left" | "right" | "top" | "bottom";

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
    paddles: Partial<Record<Side, Paddle>>;
    score: Partial<Record<Side, number>>;
}

export type GameMode = "remote" | "ai" | "tournament" | "local" | "multiplayer";

export interface Match {
    gameId: number;
    players: Partial<Record<Side, Player>>;
    ready: Partial<Record<Side, boolean>>;
    state: GameState;
    startTime: number;
    loop?: ReturnType<typeof setInterval>;
    mode: GameMode;
}

export type ClientMessage =
    | { type: "joinGame"; username: string; avatar: string; mode: GameMode; id: number; gameId?: number }
    | { type: "ready" }
    | { type: "move"; up?: boolean; down?: boolean, left?: boolean, right: boolean }
    | { type: "playAgain"; mode: GameMode }
    | { type: "leaveGame" };

export interface TournamentMatch extends Match {
    bracketId: number;
    round: number;
}
