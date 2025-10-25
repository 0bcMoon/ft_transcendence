import { GameState, Side, KeysPressed } from "../types/types";
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    MAX_SCORE,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_SPEED,
    PADDLE_OFFSET,
    BALL_RADIUS,
    BALL_SPEED_X,
    BALL_SPEED_Y,
    MAX_BOUNCE_ANGLE_DEG,
    BALL_SPEED_INCREMENT,
    BALL_SPEED_MAX,
    MIN_ABS_X_SPEED,
    SERVE_ANGLE_MIN_DEG,
    SERVE_ANGLE_MAX_DEG,
} from "./constants";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const magnitude = (x: number, y: number) => Math.hypot(x, y);

export const initState = (): GameState => ({
    paddles: {
        left: {
            x: PADDLE_OFFSET,
            y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        },
        right: {
            x: CANVAS_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH,
            y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        },
    },
    ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        speedX: BALL_SPEED_X,
        speedY: BALL_SPEED_Y
    },
    score: { left: 0, right: 0 },
});

export const movePaddles = (state: GameState, keys: KeysPressed) => {
    const { left, right } = state.paddles;
    if (!left || !right)
        return;

    if (keys.w)
        left.y -= PADDLE_SPEED;
    if (keys.s)
        left.y += PADDLE_SPEED;
    if (keys.ArrowUp)
        right.y -= PADDLE_SPEED;
    if (keys.ArrowDown)
        right.y += PADDLE_SPEED;

    left.y = Math.max(0, Math.min(left.y, CANVAS_HEIGHT - left.height));
    right.y = Math.max(0, Math.min(right.y, CANVAS_HEIGHT - right.height));
};

const handlePaddleCollision = (ball: GameState["ball"], paddles: GameState["paddles"]) => {
    if (!paddles.left || !paddles.right)
        return
    let hit = false;

    if (ball.speedX < 0 && ball.x - ball.radius <= paddles.left.x + paddles.left.width && ball.y >= paddles.left.y && ball.y <= paddles.left.y + paddles.left.height) {
        hit = true;

        const rel = clamp((ball.y - (paddles.left.y + paddles.left.height / 2)) / (paddles.left.height / 2), -1, 1);
        const currentSpeed = magnitude(ball.speedX, ball.speedY);
        const newSpeed = clamp(currentSpeed + BALL_SPEED_INCREMENT, currentSpeed, BALL_SPEED_MAX);
        const angle = rel * toRad(MAX_BOUNCE_ANGLE_DEG);

        ball.speedX = Math.max(MIN_ABS_X_SPEED, newSpeed * Math.cos(angle));
        ball.speedY = newSpeed * Math.sin(angle);

        ball.x = paddles.left.x + paddles.left.width + ball.radius;
    }

    if (ball.speedX > 0 && ball.x + ball.radius >= paddles.right.x && ball.y >= paddles.right.y && ball.y <= paddles.right.y + paddles.right.height) {
        hit = true;

        const rel = clamp((ball.y - (paddles.right.y + paddles.right.height / 2)) / (paddles.right.height / 2), -1, 1);
        const currentSpeed = magnitude(ball.speedX, ball.speedY);
        const newSpeed = clamp(currentSpeed + BALL_SPEED_INCREMENT, currentSpeed, BALL_SPEED_MAX);
        const angle = rel * toRad(MAX_BOUNCE_ANGLE_DEG);

        ball.speedX = -Math.max(MIN_ABS_X_SPEED, newSpeed * Math.cos(angle));
        ball.speedY = newSpeed * Math.sin(angle);

        ball.x = paddles.right.x - ball.radius;
    }

    return hit;
};


export const moveBall = (state: GameState, onScore: (scorer: Side) => void) => {
    const { ball, paddles } = state;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.speedY *= -1; } else if (ball.y + ball.radius > CANVAS_HEIGHT) {
        ball.y = CANVAS_HEIGHT - ball.radius;
        ball.speedY *= -1;
    }

    handlePaddleCollision(ball, paddles);

    if (ball.x + ball.radius < 0) {
        state.score.right = (state.score.right ?? 0) + 1;
        onScore("right");
        resetBall(state, "right");
    } else if (ball.x - ball.radius > CANVAS_WIDTH) {
        state.score.left = (state.score.left ?? 0) + 1;
        onScore("left");
        resetBall(state, "left");
    }

};

export const resetBall = (state: GameState, direction: Side) => {
    state.ball.x = CANVAS_WIDTH / 2;
    state.ball.y = CANVAS_HEIGHT / 2;

    const angle = Math.random() * (toRad(SERVE_ANGLE_MAX_DEG) - toRad(SERVE_ANGLE_MIN_DEG)) + toRad(SERVE_ANGLE_MIN_DEG);
    const dirX = direction === "right" ? -1 : 1;
    const dirY = Math.random() < 0.5 ? -1 : 1;

    const baseSpeed = magnitude(BALL_SPEED_X, BALL_SPEED_Y);
    state.ball.speedX = dirX * Math.max(MIN_ABS_X_SPEED, baseSpeed * Math.cos(angle));
    state.ball.speedY = dirY * baseSpeed * Math.sin(angle);
};

export const checkGameOver = (state: GameState, scorer: Side): boolean => {
    return (state.score[scorer] ?? 0) >= MAX_SCORE;
};
