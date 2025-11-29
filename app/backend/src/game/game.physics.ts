import { GameState, Side, KeysPressed } from "./game.types";
import { Canvas, Ball, Paddle, Physics, Rules } from "./game.config";

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const clamp = (val: number, min: number, max: number): number => Math.max(min, Math.min(max, val));

const magnitude = (x: number, y: number): number => Math.hypot(x, y);

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

export const movePaddles = (state: GameState, keys: KeysPressed): void => {

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

const handlePaddleCollisions = (state: GameState): void => {
    const { ball, leftPaddle, rightPaddle } = state;

    if (ball.speedX < 0 && leftPaddle) {
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
            ball.x = paddleRightEdge + Ball.RADIUS; // Correct position to prevent sticking
        }
    }

    else if (ball.speedX > 0 && rightPaddle) {
        const paddleTop = rightPaddle.y;
        const paddleBottom = rightPaddle.y + Paddle.HEIGHT;
        const paddleLeftEdge = rightPaddle.x;
        const ballRightEdge = ball.x + Ball.RADIUS;
        const ballTop = ball.y - Ball.RADIUS;
        const ballBottom = ball.y + Ball.RADIUS;

        if (ballRightEdge >= paddleLeftEdge && ball.x < rightPaddle.x + Paddle.WIDTH && ballTop < paddleBottom && ballBottom > paddleTop) {
            const relativeIntersectY = (ball.y - (paddleTop + Paddle.HEIGHT / 2)) / (Paddle.HEIGHT / 2);
            const normalizedIntersect = clamp(relativeIntersectY, -1, 1);
            const bounceAngle = normalizedIntersect * toRad(Physics.MAX_PADDLE_BOUNCE_ANGLE);

            const currentSpeed = magnitude(ball.speedX, ball.speedY);
            const newSpeed = clamp(currentSpeed + Ball.SPEED_INCREMENT, currentSpeed, Ball.SPEED_MAX);

            ball.speedX = -Math.max(Ball.MIN_ABS_SPEED_X, newSpeed * Math.cos(bounceAngle));
            ball.speedY = newSpeed * Math.sin(bounceAngle);
            ball.x = paddleLeftEdge - Ball.RADIUS; // Correct position to prevent sticking
        }
    }
};

export const moveBall = (state: GameState, onScore: (scorer: Side) => void): void => {
    const { ball } = state;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y - Ball.RADIUS <= 0) {
        ball.y = Ball.RADIUS;
        ball.speedY *= -1;
    } else if (ball.y + Ball.RADIUS >= Canvas.HEIGHT) {
        ball.y = Canvas.HEIGHT - Ball.RADIUS;
        ball.speedY *= -1;
    }

    handlePaddleCollisions(state);

    if (ball.x + Ball.RADIUS < 0) {
        state.score.right += 1;
        onScore("right");
        resetBall(state, "right");
    } else if (ball.x - Ball.RADIUS > Canvas.WIDTH) {
        state.score.left += 1;
        onScore("left");
        resetBall(state, "left");
    }
};

export const resetBall = (state: GameState, scoredSide: Side): void => {
    state.ball.x = Canvas.WIDTH / 2;
    state.ball.y = Canvas.HEIGHT / 2;

    const angleRad = toRad(
        Math.random() * (Physics.SERVE_ANGLE_RANGE.max - Physics.SERVE_ANGLE_RANGE.min) + Physics.SERVE_ANGLE_RANGE.min
    );

    const serveDirectionX = (scoredSide === "left") ? 1 : -1;

    const serveDirectionY = (Math.random() < 0.5) ? -1 : 1;

    const baseSpeed = magnitude(Ball.INITIAL_SPEED_X, Ball.INITIAL_SPEED_Y);

    state.ball.speedX = serveDirectionX * Math.max(Ball.MIN_ABS_SPEED_X, baseSpeed * Math.cos(angleRad));
    state.ball.speedY = serveDirectionY * baseSpeed * Math.sin(angleRad);
};

export const checkGameOver = (state: GameState): boolean => {

    if (state.score.left >= Rules.MAX_SCORE || state.score.right >= Rules.MAX_SCORE) {
        return true;
    }
    return false;
};
