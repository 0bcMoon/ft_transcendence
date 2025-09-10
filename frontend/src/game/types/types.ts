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
    | { type: "redy" }
    | { type: "leaveGame" }
    | { type: "1v1"; username: string }
    | { type: "ai" };


export type ServerMessage =
    | {
        id: string,
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
    | { type: "leaveGame" }


export type RemoteGame = {
    gameStateRef: React.RefObject<GameState | null>;
    countdown: number | null;
    waiting: boolean;
    isGameOver: boolean;
    winner: "left" | "right" | null;
    side: "left" | "right" | null;
    playerNames: { left: string; right: string } | null;
    finalScore: { left: number; right: number } | null;
    handlePlayAgain: () => void;
    handleGoHome: () => void;
};

