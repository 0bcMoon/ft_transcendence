import { GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS } from "../constants";
import type { GameState, Side } from "../types/types";

export function launchBall(
    state: GameState,
    direction?: Side,
    baseSpeed = 6,         // starting speed in px/tick
    rallyBoost = 0         // extra speed from rally count
) {
    state.ball.x = GAME_WIDTH / 2;
    state.ball.y = GAME_HEIGHT / 2;
    state.ball.radius = BALL_RADIUS;

    const dirX = direction ? (direction === "left" ? -1 : 1) : (Math.random() < 0.5 ? -1 : 1);

    const maxAngle = Math.PI / 4; // 45°
    const angle = (Math.random() * (maxAngle * 2) - maxAngle) / 2; // ±22.5°

    let vx = Math.cos(angle) * dirX;
    let vy = Math.sin(angle);

    const length = Math.sqrt(vx * vx + vy * vy);
    vx /= length;
    vy /= length;

    const speed = baseSpeed + rallyBoost;
    state.ball.speedX = vx * speed;
    state.ball.speedY = vy * speed;
}

