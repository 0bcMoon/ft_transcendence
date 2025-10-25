import { WebSocket } from "ws";

export type Side = "left" | "right";

export interface Player {
    id: number;
    username: string;
    socket: WebSocket | null;
}

export interface PaddleState {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}

export interface BallState {
    x: number;
    y: number;
    radius: number;
    speedX: number;
    speedY: number;
}

export interface ScoreState {
    left: number;
    right: number;
}

export interface MatchState {
    ball: BallState;
    paddles: {
        left: PaddleState;
        right: PaddleState;
    };
    score: ScoreState;
}

export interface Match {
    game_id: number;
    players: { left: Player; right: Player };
    state: MatchState;
    ready: { left: boolean; right: boolean };
    startTime: number;
    loop?: NodeJS.Timeout;
}
