import type { WebSocket } from "ws";

export interface Player {
    id: number;
    username: string;
    avatar: string;
    socket: WebSocket | null;
    mode?: GameMode;
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

export type GameMode = "1v1" | "ai" | "tournament" | "local" | "4p";

export interface Match {
    game_id: number;
    players: Partial<Record<Side, Player>>;
    ready: Partial<Record<Side, boolean>>;
    state: GameState;
    startTime: number;
    loop?: ReturnType<typeof setInterval>;
    mode: GameMode;
}

export type ClientMessage =
    | { type: "joinGame"; mode: GameMode; username: string; avatar: string }
    | { type: "ready" }
    | { type: "move"; up?: boolean; down?: boolean, left?: boolean, right: boolean }
    | { type: "playAgain"; mode?: GameMode }
    | { type: "leaveGame" };

export interface TournamentMatch extends Match {
    bracketId: number;
    round: number;
}
