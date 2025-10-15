import { GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS, BALL_SPEED_X, BALL_SPEED_Y } from "../constants";

import type { GameState, GameMode, Side, Paddle } from "../types/types";

export function initState(mode: GameMode): GameState {
    const paddles: Partial<Record<Side, Paddle>> = {};
    const score: Partial<Record<Side, number>> = {};

    if (mode === "remote" || mode === "tournament") {
        paddles.left = {
            x: 30,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        paddles.right = {
            x: GAME_WIDTH - 40,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        score.left = 0;
        score.right = 0;
    }

    if (mode === "multiplayer") {
        paddles.left = {
            x: 30,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        paddles.right = {
            x: GAME_WIDTH - 40,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        paddles.top = {
            x: GAME_WIDTH / 2 - PADDLE_HEIGHT / 2,
            y: 30,
            width: PADDLE_HEIGHT,
            height: PADDLE_WIDTH,
        };
        paddles.bottom = {
            x: GAME_WIDTH / 2 - PADDLE_HEIGHT / 2,
            y: GAME_HEIGHT - 40,
            width: PADDLE_HEIGHT,
            height: PADDLE_WIDTH,
        };
        score.left = score.right = score.top = score.bottom = 0;
    }

    return {
        paddles,
        score,
        ball: {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            radius: BALL_RADIUS,
            speedX: BALL_SPEED_X,
            speedY: BALL_SPEED_Y,
        },
    };
}
