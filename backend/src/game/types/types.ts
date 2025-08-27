// --- Core types ---

export type Side = "left" | "right";

export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
}

export interface Score {
    left: number;
    right: number;
}

export interface GameState {
    status: "waiting" | "playing" | "ended";
    paddles: {
        left: Paddle;
        right: Paddle;
    };
    ball: Ball;
    score: Score;
}

// --- Messages from client to server ---

export type ClientMessage =
    | { type: "move"; up: boolean; down: boolean }
    | { type: "playAgain" }
    | { type: "start" }
    | { type: "leaveGame" }
    | { type: "identify"; username: string };

// --- Messages from server to client ---

export type ServerMessage =
    | {
        type: "matchFound";
        side: Side;
        leftUsername: string;
        rightUsername: string;
    }
    | { type: "state"; state: GameState }
    | {
        type: "gameOver";
        winner: Side;
        score: Score;
    }
    | { type: "matchEnded" }
    | { type: "waitingForOpponent" }


