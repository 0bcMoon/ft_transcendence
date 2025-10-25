import {
    GAME_WIDTH,
    GAME_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    BALL_RADIUS,
    BALL_SPEED_X,
    BALL_SPEED_Y
} from "../constants";

import { GameState } from "../types/types";

export function initState4P(): GameState {
    return {
        paddles: {
            left: { x: 30, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
            right: { x: GAME_WIDTH - 40, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
            top: { x: GAME_WIDTH / 2 - PADDLE_HEIGHT / 2, y: 30, width: PADDLE_HEIGHT, height: PADDLE_WIDTH },
            bottom: { x: GAME_WIDTH / 2 - PADDLE_HEIGHT / 2, y: GAME_HEIGHT - 40, width: PADDLE_HEIGHT, height: PADDLE_WIDTH },
        },
        ball: {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            radius: BALL_RADIUS,
            speedX: BALL_SPEED_X,
            speedY: BALL_SPEED_Y,
        },
        score: { left: 0, right: 0, top: 0, bottom: 0 },
    };
}

