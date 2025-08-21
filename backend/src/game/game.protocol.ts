export type GameStatus = "waiting" | "playing" | "finished";

export interface GameState {
    ballX: number;
    ballY: number;
    ballVelX: number;
    ballVelY: number;
    paddle1Y: number;
    paddle2Y: number;
    score1: number;
    score2: number;
    isPlaying: boolean;
    paddleWidth: number; // <-- add this
    paddleHeight: number; // <-- add this
}

export interface GameStartData {
    playerNumber: 1 | 2;
    roomId: string;
    gameState: GameState;
}

export interface GameOverData {
    winner: 1 | 2;
    finalScore: { player1: number; player2: number };
}

export type GameMessage =
    | {
        type: "paddle_move";
        data: { y: number };
        playerId?: number;
        roomId?: string;
    }
    | {
        type: "game_start";
        data: GameStartData;
        playerId: number;
        roomId: string;
    }
    | { type: "game_state"; data: GameState; roomId: string }
    | {
        type: "score_update";
        data: { score1: number; score2: number };
        roomId: string;
    }
    | { type: "game_over"; data: GameOverData; roomId: string }
    | { type: "waiting"; data?: undefined; roomId?: string }
    | { type: "player_joined"; data?: { playerId: number }; roomId?: string };
