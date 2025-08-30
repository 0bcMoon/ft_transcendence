import type { GameState } from "../types/types";

export function checkCollision(state: GameState) {
    const { left, right } = state.paddles;
    const ball = state.ball;

    // Left paddle
    if (
        ball.x - ball.radius < left.x + left.width &&
        ball.y > left.y &&
        ball.y < left.y + left.height
    ) {
        ball.speedX *= -1;
        ball.x = left.x + left.width + ball.radius;
    }

    // Right paddle
    if (
        ball.x + ball.radius > right.x &&
        ball.y > right.y &&
        ball.y < right.y + right.height
    ) {
        ball.speedX *= -1;
        ball.x = right.x - ball.radius;
    }
}
