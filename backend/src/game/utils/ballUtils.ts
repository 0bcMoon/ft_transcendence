import { GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, BALL_SPEED_X, BALL_SPEED_Y } from "../constants";
import type { GameState, Side } from "../types/types";


export function launchBall(state: GameState, toward: Side) {
    state.ball.x = GAME_WIDTH / 2;
    state.ball.y = GAME_HEIGHT / 2;

    const dirX = toward === "left" ? -1 : 1;
    state.ball.speedX = dirX * BALL_SPEED_X;

    const dirY = Math.random() < 0.5 ? -1 : 1;
    state.ball.speedY = dirY * BALL_SPEED_Y;

    state.ball.radius = BALL_RADIUS;
}

