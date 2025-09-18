import type { WebSocket } from "ws";

export interface Player {
    id: number;
    username: string;
    socket: WebSocket | null;
}

export type Side = "left" | "right";

interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface GameState {
    ball: { x: number; y: number; speedX: number; speedY: number; radius: number };
    paddles: { left: Paddle; right: Paddle };
    score: { left: number; right: number };
}

export type ClientMessage =
    | { type: "1v1"; username: string }
    | { type: "ready" }
    | { type: "move"; up?: boolean; down?: boolean }
    | { type: "playAgain" }
    | { type: "leaveGame" }
    | { type: "ai", username: string };

export type ServerMessage =
    | { type: "matchFound"; side: Side; leftUsername: string; rightUsername: string; id: string }
    | { type: "state"; state: GameState }
    | { type: "gameOver"; winner: Side; score: { left: number; right: number } };

