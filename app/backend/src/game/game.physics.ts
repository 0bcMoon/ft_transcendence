import { GameState, Side, KeysPressed } from "./game.types";

import { 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT, 
    PADDLE_WIDTH, 
    PADDLE_HEIGHT, 
    PADDLE_OFFSET, 
    PADDLE_SPEED,
    BALL_RADIUS, 
    BALL_SPEED_X, 
    BALL_SPEED_Y,
    BALL_INCREMENT,
    BALL_SPEED_MAX,
    BALL_MIN_ABS_SPEED_X,
    MAX_PADDLE_BOUNCE_ANGLE,
    SERVE_ANGLE_RANGE
} from './constants';

import {Ball, Score} from "./game.types";

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const clamp = (val: number, min: number, max: number): number => Math.max(min, Math.min(max, val));

const magnitude = (x: number, y: number): number => Math.hypot(x, y);

export const initState = (): GameState => ({

    leftPaddle: {
        x: PADDLE_OFFSET,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT
    },
    rightPaddle: {
        x: CANVAS_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH,
        y: PADDLE_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT
    },
    ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        speedX: BALL_SPEED_X,
        speedY: BALL_SPEED_Y,
    },
    score: { left: 0, right: 0 },
});

export const movePaddles = (state: GameState, keys: KeysPressed): void => {

    if (state.leftPaddle) {
        if (keys.w)
            state.leftPaddle.y -= PADDLE_SPEED;
        if (keys.s)
            state.leftPaddle.y += PADDLE_SPEED;
        state.leftPaddle.y = clamp(state.leftPaddle.y, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);
    }

    if (state.rightPaddle) {
        if (keys.ArrowUp)
            state.rightPaddle.y -= PADDLE_SPEED;
        if (keys.ArrowDown)
            state.rightPaddle.y += PADDLE_SPEED;
        state.rightPaddle.y = clamp(state.rightPaddle.y, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);
    }
};

export const handlePaddleCollision = (state: GameState): void => {
    const { ball, leftPaddle, rightPaddle } = state;

    if (ball.speedX < 0 && leftPaddle) {
        const paddleTop = leftPaddle.y;
        const paddleBottom = leftPaddle.y + PADDLE_HEIGHT;
        const paddleRightEdge = leftPaddle.x + PADDLE_WIDTH;
        const ballLeftEdge = ball.x - BALL_RADIUS;
        const ballTop = ball.y - BALL_RADIUS;
        const ballBottom = ball.y + BALL_RADIUS;

        if (ballLeftEdge <= paddleRightEdge && ball.x > leftPaddle.x && ballTop < paddleBottom && ballBottom > paddleTop) {
            const relativeIntersectY = (ball.y - (paddleTop + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
            const normalizedIntersect = clamp(relativeIntersectY, -1, 1);
            const bounceAngle = normalizedIntersect * toRad(MAX_PADDLE_BOUNCE_ANGLE);

            const currentSpeed = magnitude(ball.speedX, ball.speedY);
            const newSpeed = clamp(currentSpeed + BALL_INCREMENT, currentSpeed, BALL_SPEED_MAX);

            ball.speedX = Math.max(BALL_MIN_ABS_SPEED_X, newSpeed * Math.cos(bounceAngle));
            ball.speedY = newSpeed * Math.sin(bounceAngle);
            ball.x = paddleRightEdge + BALL_RADIUS;
        }
    }

    else if (ball.speedX > 0 && rightPaddle) {
        const paddleTop = rightPaddle.y;
        const paddleBottom = rightPaddle.y + PADDLE_HEIGHT;
        const paddleLeftEdge = rightPaddle.x;
        const ballRightEdge = ball.x + BALL_RADIUS;
        const ballTop = ball.y - BALL_RADIUS;
        const ballBottom = ball.y + BALL_RADIUS;

        if (ballRightEdge >= paddleLeftEdge && ball.x < rightPaddle.x + PADDLE_WIDTH && ballTop < paddleBottom && ballBottom > paddleTop) {
            const relativeIntersectY = (ball.y - (paddleTop + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
            const normalizedIntersect = clamp(relativeIntersectY, -1, 1);
            const bounceAngle = normalizedIntersect * toRad(MAX_PADDLE_BOUNCE_ANGLE);

            const currentSpeed = magnitude(ball.speedX, ball.speedY);
            const newSpeed = clamp(currentSpeed + BALL_INCREMENT, currentSpeed, BALL_SPEED_MAX);

            ball.speedX = -Math.max(BALL_MIN_ABS_SPEED_X, newSpeed * Math.cos(bounceAngle));
            ball.speedY = newSpeed * Math.sin(bounceAngle);
            ball.x = paddleLeftEdge - BALL_RADIUS; 
        }
    }
};


export const moveBall = (ball: Ball): void => {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Bounce off top
    if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.speedY *= -1;
    } 
    // Bounce off bottom
    else if (ball.y + ball.radius >= CANVAS_HEIGHT) {
        ball.y = CANVAS_HEIGHT - ball.radius;
        ball.speedY *= -1;
    }
};

export const handleScoring = (ball: Ball, score: Score): void => {
    // Right player scores
    if (ball.x + BALL_RADIUS < 0) {
        score.right += 1;
        resetBall(ball, 'right');
    } 
    // Left player scores
    else if (ball.x - BALL_RADIUS > CANVAS_WIDTH) {
        score.left += 1;
        resetBall(ball, 'left');
    }
};

export const resetBall = (ball: Ball, side: Side): void => {
    // Center the ball
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;

    // Random serve angle
    const angleRad = toRad(
        Math.random() * (SERVE_ANGLE_RANGE.max - SERVE_ANGLE_RANGE.min) + SERVE_ANGLE_RANGE.min
    );

    // Serve direction
    const dirX = side === 'left' ? 1 : -1;
    const dirY = Math.random() < 0.5 ? -1 : 1;

    const baseSpeed = magnitude(BALL_SPEED_X, BALL_SPEED_Y);

    ball.speedX = dirX * Math.max(BALL_MIN_ABS_SPEED_X, baseSpeed * Math.cos(angleRad));
    ball.speedY = dirY * baseSpeed * Math.sin(angleRad);
};

export const isGameOver = (score: Score): boolean => {

    if (score.left >= 5 || score.right >= 5) {
        return true;
    }
    return false;
};
