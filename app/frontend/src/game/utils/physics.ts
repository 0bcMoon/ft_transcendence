import { GameState, Side, KeysPressed } from "../types/types";
import { Canvas, Ball, Paddle, Physics, Rules } from "../utils/gameConfig";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const magnitude = (x: number, y: number) => Math.hypot(x, y);

export const initState = (): GameState => ({
    leftPaddle: {
        x: Paddle.OFFSET,
        y: Canvas.HEIGHT / 2 - Paddle.HEIGHT / 2,
        width: Paddle.WIDTH,
        height: Paddle.HEIGHT
    },
    rightPaddle: {
        x: Canvas.WIDTH - Paddle.OFFSET - Paddle.WIDTH,
        y: Canvas.HEIGHT / 2 - Paddle.HEIGHT / 2,
        width: Paddle.WIDTH,
        height: Paddle.HEIGHT
    },
    ball: {
        x: Canvas.WIDTH / 2,
        y: Canvas.HEIGHT / 2,
        radius: Ball.RADIUS,
        speedX: Ball.INITIAL_SPEED_X,
        speedY: Ball.INITIAL_SPEED_Y
    },
    score: { left: 0, right: 0 },
});

export const movePaddles = (state: GameState, keys: KeysPressed) => {
    if (state.leftPaddle) {
        if (keys.w)
            state.leftPaddle.y -= Paddle.SPEED;
        if (keys.s)
            state.leftPaddle.y += Paddle.SPEED;
        state.leftPaddle.y = clamp(state.leftPaddle.y, 0, Canvas.HEIGHT - Paddle.HEIGHT);
    }

    if (state.rightPaddle) {
        if (keys.ArrowUp)
            state.rightPaddle.y -= Paddle.SPEED;
        if (keys.ArrowDown)
            state.rightPaddle.y += Paddle.SPEED;
        state.rightPaddle.y = clamp(state.rightPaddle.y, 0, Canvas.HEIGHT - Paddle.HEIGHT);
    }
};

const handlePaddleCollisions = (state: GameState): boolean => {
    const { ball, leftPaddle, rightPaddle } = state;
    let collisionOccurred = false;

    if (ball.speedX < 0 && leftPaddle) { // Ball moving left AND left paddle exists
        const paddleTop = leftPaddle.y;
        const paddleBottom = leftPaddle.y + Paddle.HEIGHT;
        const paddleRightEdge = leftPaddle.x + Paddle.WIDTH;
        const ballLeftEdge = ball.x - Ball.RADIUS;
        const ballTop = ball.y - Ball.RADIUS;
        const ballBottom = ball.y + Ball.RADIUS;

        if (ballLeftEdge <= paddleRightEdge && ball.x > leftPaddle.x && ballTop < paddleBottom && ballBottom > paddleTop) {
            const relativeIntersectY = (ball.y - (paddleTop + Paddle.HEIGHT / 2)) / (Paddle.HEIGHT / 2);
            const normalizedIntersect = clamp(relativeIntersectY, -1, 1);
            const bounceAngle = normalizedIntersect * toRad(Physics.MAX_PADDLE_BOUNCE_ANGLE);

            const currentSpeed = magnitude(ball.speedX, ball.speedY);
            const newSpeed = clamp(currentSpeed + Ball.SPEED_INCREMENT, currentSpeed, Ball.SPEED_MAX);

            ball.speedX = Math.max(Ball.MIN_ABS_SPEED_X, newSpeed * Math.cos(bounceAngle));
            ball.speedY = newSpeed * Math.sin(bounceAngle);
            ball.x = paddleRightEdge + Ball.RADIUS;
            collisionOccurred = true;
        }
    }

    else if (ball.speedX > 0 && rightPaddle) { // Ball moving right AND right paddle exists
        const paddleTop = rightPaddle.y;
        const paddleBottom = rightPaddle.y + Paddle.HEIGHT;
        const paddleLeftEdge = rightPaddle.x;
        const ballRightEdge = ball.x + Ball.RADIUS;
        const ballTop = ball.y - Ball.RADIUS;
        const ballBottom = ball.y + Ball.RADIUS;

        if (ballRightEdge >= paddleLeftEdge && ball.x < rightPaddle.x + Paddle.WIDTH && ballTop < paddleBottom && ballBottom > paddleTop) {
            // --- Calculate Bounce Physics ---
            const relativeIntersectY = (ball.y - (paddleTop + Paddle.HEIGHT / 2)) / (Paddle.HEIGHT / 2);
            const normalizedIntersect = clamp(relativeIntersectY, -1, 1);
            const bounceAngle = normalizedIntersect * toRad(Physics.MAX_PADDLE_BOUNCE_ANGLE);

            const currentSpeed = magnitude(ball.speedX, ball.speedY);
            const newSpeed = clamp(currentSpeed + Ball.SPEED_INCREMENT, currentSpeed, Ball.SPEED_MAX);

            ball.speedX = -Math.max(Ball.MIN_ABS_SPEED_X, newSpeed * Math.cos(bounceAngle)); // Move left
            ball.speedY = newSpeed * Math.sin(bounceAngle);
            ball.x = paddleLeftEdge - Ball.RADIUS; // Correct position
            collisionOccurred = true;
        }
    }
    return collisionOccurred;
};

export const moveBall = (state: GameState, onScore: (scorer: Side) => void) => {

    state.ball.x += state.ball.speedX;
    state.ball.y += state.ball.speedY;

    // Wall Collision (Top/Bottom)
    if (state.ball.y - Ball.RADIUS <= 0) {
        state.ball.y = Ball.RADIUS;
        state.ball.speedY *= -1;
    } else if (state.ball.y + Ball.RADIUS >= Canvas.HEIGHT) {
        state.ball.y = Canvas.HEIGHT - Ball.RADIUS;
        state.ball.speedY *= -1;
    }

    handlePaddleCollisions(state);

    if (state.ball.x + Ball.RADIUS < 0) {
        state.score.right = (state.score.right ?? 0) + 1;
        onScore("right");
        resetBall(state, "right");
    } else if (state.ball.x - Ball.RADIUS > Canvas.WIDTH) {
        state.score.left = (state.score.left ?? 0) + 1;
        onScore("left");
        resetBall(state, "left");
    }
};

export const resetBall = (state: GameState, scoredSide: Side) => {

    state.ball.x = Canvas.WIDTH / 2;
    state.ball.y = Canvas.HEIGHT / 2;

    const angleRad = toRad(
        Math.random() * (Physics.SERVE_ANGLE_RANGE.max - Physics.SERVE_ANGLE_RANGE.min) + Physics.SERVE_ANGLE_RANGE.min);

    const serveDirectionX = (scoredSide === "left") ? 1 : -1;
    const serveDirectionY = Math.random() < 0.5 ? -1 : 1;

    const baseSpeed = magnitude(Ball.INITIAL_SPEED_X, Ball.INITIAL_SPEED_Y);
    state.ball.speedX = serveDirectionX * Math.max(Ball.MIN_ABS_SPEED_X, baseSpeed * Math.cos(angleRad));
    state.ball.speedY = serveDirectionY * baseSpeed * Math.sin(angleRad);
};

export const checkGameOver = (state: GameState): boolean => {
    if ((state.score.left ?? 0) >= Rules.MAX_SCORE)
        return true;
    if ((state.score.right ?? 0) >= Rules.MAX_SCORE)
        return true;
    return false;
};
