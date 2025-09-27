import { Ball, GameConfig, GameState, KeyState, Paddle } from './types';
import { GAME_CONFIG } from './constants';

export class PongEngine {
    private ball: Ball;
    private paddles: { player1: Paddle; player2: Paddle };
    private gameState: GameState;
    private keyState: KeyState;
    private config: GameConfig;
    private isGameOverInternal: boolean;
    private previousBallPosition: { x: number, y: number };
    private isResettingBall: boolean; // Flag to track ball reset state

    constructor(player1Name: string, player2Name: string, config: GameConfig = GAME_CONFIG) {
        this.config = config;
        this.isGameOverInternal = false;
        this.isResettingBall = false;

        // Initialize game state
        this.gameState = {
            player1: player1Name,
            player2: player2Name,
            isGameOver: false,
            winner: null,
            scores: { player1: 0, player2: 0 }
        };

        this.ball = {
            position: { x: this.config.canvasWidth / 2, y: this.config.canvasHeight / 2 },
            size: config.ballSize,
            velocity: {
                x: this.config.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
                y: this.config.ballAngle * (Math.random() > 0.5 ? 1 : -1)
            }
        };

        this.previousBallPosition = { ...this.ball.position };


        this.paddles = {
            player1: {
                width: config.paddleWidth,
                height: config.paddleHeight,
                position: {
                    x: this.config.paddleOffset,
                    y: (this.config.canvasHeight - config.paddleHeight) / 2
                },
                speed: 10
            },
            player2: {
                width: config.paddleWidth,
                height: config.paddleHeight,
                position: {
                    x: this.config.canvasWidth - this.config.paddleOffset - 15,
                    y: (this.config.canvasHeight - config.paddleHeight) / 2
                },
                speed: 10
            }
        };

        this.keyState = {
            w: false,
            s: false,
            arrowUp: false,
            arrowDown: false
        };
    }

    // Get current game state (immutable copy)
    getGameState(): GameState {
        return { ...this.gameState };
    }

    // Get ball state (immutable copy)
    getBall(): Ball {
        return {
            ...this.ball,
            position: { ...this.ball.position },
            velocity: { ...this.ball.velocity }
        };
    }

    // Get paddles state (immutable copy)
    getPaddles(): { player1: Paddle; player2: Paddle } {
        return {
            player1: {
                ...this.paddles.player1,
                position: { ...this.paddles.player1.position }
            },
            player2: {
                ...this.paddles.player2,
                position: { ...this.paddles.player2.position }
            }
        };
    }

    // Update key state - Modified to handle ball reset state
    setKeyState(key: keyof KeyState, isPressed: boolean): void {
        if (this.isGameOverInternal) return;

        // Always allow key updates even during ball reset
        this.keyState[key] = isPressed;
    }

    // Reset the game
    reset(): void {
        this.isGameOverInternal = false;
        this.isResettingBall = false;
        this.gameState.isGameOver = false;
        this.gameState.winner = null;
        this.gameState.scores.player1 = 0;
        this.gameState.scores.player2 = 0;

        this.resetBall();

        // Reset paddle positions
        this.paddles.player1.position.y = (this.config.canvasHeight - this.paddles.player1.height) / 2;
        this.paddles.player2.position.y = (this.config.canvasHeight - this.paddles.player2.height) / 2;

        // Clear all key states
        Object.keys(this.keyState).forEach(key => {
            this.keyState[key as keyof KeyState] = false;
        });
    }

    // Update game state for one frame - Modified to handle ball reset
    update(): void {
        if (this.isGameOverInternal) return;

        // Always update paddle positions regardless of ball reset state
        this.movePaddles();

        // If we're in ball reset state, handle it differently
        if (this.isResettingBall) {
            // Clear the reset state after a frame
            this.isResettingBall = false;

            // Make sure ball position is correct
            this.previousBallPosition = { ...this.ball.position };
            return;
        }

        // Save previous ball position for collision detection
        this.previousBallPosition = { ...this.ball.position };

        this.moveBall();
        this.handleCollisions();
        this.checkScoring();
    }

    private movePaddles(): void {

        if (this.keyState.w && this.paddles.player1.position.y > 0) {
            this.paddles.player1.position.y -= this.paddles.player1.speed;
        }
        if (this.keyState.s && this.paddles.player1.position.y < this.config.canvasHeight - this.paddles.player1.height) {
            this.paddles.player1.position.y += this.paddles.player1.speed;
        }

        if (this.keyState.arrowUp && this.paddles.player2.position.y > 0) {
            this.paddles.player2.position.y -= this.paddles.player2.speed;
        }
        if (this.keyState.arrowDown && this.paddles.player2.position.y < this.config.canvasHeight - this.paddles.player2.height) {
            this.paddles.player2.position.y += this.paddles.player2.speed;
        }
    }

    private moveBall(): void {
        this.ball.position.x += this.ball.velocity.x;
        this.ball.position.y += this.ball.velocity.y;
    }

    // Handle all collision detection
    private handleCollisions(): void {
        this.handleWallCollisions();
        this.handlePaddleCollisions();
    }

    // Handle ball collisions with walls
    private handleWallCollisions(): void {
        // Top and bottom wall collisions
        if (this.ball.position.y - this.ball.size / 2 < 0 ||
            this.ball.position.y + this.ball.size / 2 > this.config.canvasHeight) {
            this.ball.velocity.y = -this.ball.velocity.y;

            // Ensure ball stays within bounds
            if (this.ball.position.y - this.ball.size / 2 < 0) {
                this.ball.position.y = this.ball.size / 2;
            } else if (this.ball.position.y + this.ball.size / 2 > this.config.canvasHeight) {
                this.ball.position.y = this.config.canvasHeight - this.ball.size / 2;
            }
        }
    }

    // Handle ball collisions with paddles
    private handlePaddleCollisions(): void {
        const ball = this.ball;
        const prevPos = this.previousBallPosition;

        // Helper function to check if ball trajectory crossed a paddle
        const didBallCrossPaddle = (paddleX: number, movingRight: boolean) => {
            if (movingRight) {
                return prevPos.x + ball.size / 2 <= paddleX && ball.position.x + ball.size / 2 > paddleX;
            } else {
                return prevPos.x - ball.size / 2 >= paddleX && ball.position.x - ball.size / 2 < paddleX;
            }
        };

        // Player 1 paddle collision (left paddle)
        const paddle1Right = this.paddles.player1.position.x + this.paddles.player1.width;
        const movingLeft = ball.velocity.x < 0;

        if (movingLeft && didBallCrossPaddle(paddle1Right, false) &&
            ball.position.y > this.paddles.player1.position.y &&
            ball.position.y < this.paddles.player1.position.y + this.paddles.player1.height) {

            // Adjust ball position to avoid getting stuck
            ball.position.x = paddle1Right + ball.size / 2;
            ball.velocity.x = Math.abs(ball.velocity.x);

            // Adjust angle based on where ball hits the paddle
            const hitPosition = (ball.position.y - this.paddles.player1.position.y) / this.paddles.player1.height;
            ball.velocity.y = this.config.paddleHitAngleFactor * (hitPosition - 0.5);

            // Increase speed slightly
            ball.velocity.x *= this.config.ballSpeedIncrease;
        }

        // Player 2 paddle collision (right paddle)
        const paddle2Left = this.paddles.player2.position.x;
        const movingRight = ball.velocity.x > 0;

        if (movingRight && didBallCrossPaddle(paddle2Left, true) &&
            ball.position.y > this.paddles.player2.position.y &&
            ball.position.y < this.paddles.player2.position.y + this.paddles.player2.height) {

            // Adjust ball position to avoid getting stuck
            ball.position.x = paddle2Left - ball.size / 2;
            ball.velocity.x = -Math.abs(ball.velocity.x);

            // Adjust angle based on where ball hits the paddle
            const hitPosition = (ball.position.y - this.paddles.player2.position.y) / this.paddles.player2.height;
            ball.velocity.y = this.config.paddleHitAngleFactor * (hitPosition - 0.5);

            // Increase speed slightly
            ball.velocity.x *= this.config.ballSpeedIncrease;
        }
    }

    // Check if a player scored - Modified to handle edge cases
    private checkScoring(): void {
        // If we're already resetting, don't check again
        if (this.isResettingBall) return;

        // Player 2 scores (ball goes past left edge)
        if (this.ball.position.x < 0) {
            this.updateScore(2);
        }

        // Player 1 scores (ball goes past right edge)
        if (this.ball.position.x > this.config.canvasWidth) {
            this.updateScore(1);
        }
    }

    // Update score and check for game end - Modified to handle edge cases
    private updateScore(player: 1 | 2): void {
        if (this.isGameOverInternal || this.isResettingBall) return;

        // Set the resetting flag to prevent duplicate score updates
        this.isResettingBall = true;

        if (player === 1) {
            this.gameState.scores.player1 += 1;
        } else {
            this.gameState.scores.player2 += 1;
        }

        // Check for game over
        const { player1, player2 } = this.gameState.scores;
        if (player1 >= this.config.winningScore && player1 - player2 >= this.config.winMargin) {
            this.endGame(this.gameState.player1);
        } else if (player2 >= this.config.winningScore && player2 - player1 >= this.config.winMargin) {
            this.endGame(this.gameState.player2);
        } else {
            // Reset ball for next point
            this.resetBall(player === 1 ? 1 : -1);
        }
    }

    // Reset ball to center with direction
    private resetBall(direction: number = 1): void {
        this.ball.position.x = this.config.canvasWidth / 2;
        this.ball.position.y = this.config.canvasHeight / 2;
        this.ball.velocity.x = this.config.ballSpeed * direction;
        this.ball.velocity.y = this.config.ballAngle * (Math.random() > 0.5 ? 1 : -1);

        // Reset previous position too
        this.previousBallPosition = { ...this.ball.position };
    }

    // End the game
    private endGame(winner: string): void {
        this.isGameOverInternal = true;
        this.isResettingBall = false;
        this.gameState.isGameOver = true;
        this.gameState.winner = winner;
    }
}
