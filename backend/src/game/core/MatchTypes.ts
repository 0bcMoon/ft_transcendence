import type { WebSocket } from "ws";
import { AIController } from "../AIController";

export interface Player {
    id: number;
    username: string;
    socket: WebSocket | null;
}



export interface Match {
    game_id: number; // DB games.id (INTEGER AUTOINCREMENT)
    players: Record<Side, Player>; // left/right players
    state: GameState; // current game state
    loop?: NodeJS.Timeout; // game loop interval
    ready: Record<Side, boolean>; // ready status per side
    aiSide?: Side; // if AI is playing, which side
    aiIntent?: { up: boolean; down: boolean }; // AI movement intent
    aiController?: AIController; // optional AI controller instance
    startTime: number;
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
    // status: "waiting" | "playing" | "gameOver";
}

export type ClientMessage =
    | { type: "remote_1v1"; username: string }
    | { type: "ready" }
    | { type: "move"; up?: boolean; down?: boolean }
    | { type: "playAgain" }
    | { type: "leaveGame" }
    | { type: "ai", username: string };

export type ServerMessage =
    | { type: "matchFound"; side: Side; leftUsername: string; rightUsername: string; id: string }
    | { type: "state"; state: GameState }
    | { type: "gameOver"; winner: Side; score: { left: number; right: number } };

