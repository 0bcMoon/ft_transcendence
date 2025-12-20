import React, { useEffect, useRef } from "react";
import { GameState } from "../types/types";
import { Canvas, Effects, Colors, Fonts } from "../utils/gameConfig";

interface GameCanvasProps {
    gameStateRef: React.MutableRefObject<GameState | null>;
    isGameOver: boolean;
    waiting?: boolean;
    countdown: number | null;
    userSide?: "left" | "right";
    winner?: "left" | "right" | null;
}

export default function GameCanvas({
    gameStateRef,
    isGameOver,
    countdown,
    waiting,
    userSide,
    winner
}: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationTimeRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let animationFrameId: number;

        const drawBackground = () => {
            ctx.fillStyle = Colors.BACKGROUND;
            ctx.fillRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
        };

        const drawCenterLine = () => {
            ctx.save();
            ctx.setLineDash([10, 15]);
            ctx.strokeStyle = Colors.LINES;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(Canvas.WIDTH / 2, 10);
            ctx.lineTo(Canvas.WIDTH / 2, Canvas.HEIGHT - 10);
            ctx.stroke();
            ctx.restore();
        };

        const drawScore = (state: GameState) => {
            ctx.fillStyle = Colors.SCORE_TEXT;
            ctx.font = Fonts.SCORE;
            ctx.textAlign = "center";
            ctx.fillText(state.score.left.toString(), Canvas.WIDTH / 2 - 90, 90);
            ctx.fillText(state.score.right.toString(), Canvas.WIDTH / 2 + 90, 90);
        };

        const drawGlowElement = (draw: () => void, color: string) => {
            ctx.save();
            ctx.shadowBlur = Effects.GLOW_BLUR;
            ctx.shadowColor = color;
            draw();
            ctx.restore();
        };

        const drawPaddles = (state: GameState) => {
            if (state.leftPaddle) {
                drawGlowElement(() => {
                    ctx.fillStyle = Colors.PADDLE_LEFT;
                    ctx.fillRect(state.leftPaddle.x, state.leftPaddle.y, state.leftPaddle.width, state.leftPaddle.height);
                }, Colors.PADDLE_LEFT);
            }
            if (state.rightPaddle) {
                drawGlowElement(() => {
                    ctx.fillStyle = Colors.PADDLE_RIGHT;
                    ctx.fillRect(state.rightPaddle.x, state.rightPaddle.y, state.rightPaddle.width, state.rightPaddle.height);
                }, Colors.PADDLE_RIGHT);
            }
        };

        const drawBall = (state: GameState) => {
            drawGlowElement(() => {
                ctx.fillStyle = Colors.BALL;
                ctx.beginPath();
                ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
                ctx.fill();
            }, Colors.BALL);
        };

        const drawCountdown = (value: number) => {
            ctx.fillStyle = Colors.COUNTDOWN_TEXT;
            ctx.font = Fonts.COUNTDOWN;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.globalAlpha = 0.9;
            ctx.fillText(value.toString(), Canvas.WIDTH / 2, Canvas.HEIGHT / 2);
            ctx.globalAlpha = 1.0;
        };

        const drawWaitingState = (time: number) => {
            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Finding Match', Canvas.WIDTH / 2, Canvas.HEIGHT / 2 - 60);

            const loaderRadius = 40;
            const loaderX = Canvas.WIDTH / 2;
            const loaderY = Canvas.HEIGHT / 2 + 80;
            const rotation = (time / 1000) * Math.PI * 2;

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(loaderX, loaderY, loaderRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#3b82f6';
            ctx.beginPath();
            ctx.arc(loaderX, loaderY, loaderRadius, rotation, rotation + Math.PI * 1.5);
            ctx.stroke();
            ctx.shadowBlur = 0;

            const pulseScale = 0.8 + Math.sin(time / 500) * 0.2;
            const paddleWidth = 20;
            const paddleHeight = 100 * pulseScale;
            const paddleY = Canvas.HEIGHT / 2 - paddleHeight / 2;

            ctx.globalAlpha = 0.3 + Math.sin(time / 500) * 0.2;
            drawGlowElement(() => {
                ctx.fillStyle = Colors.PADDLE_LEFT;
                ctx.fillRect(50, paddleY, paddleWidth, paddleHeight);
            }, Colors.PADDLE_LEFT);

            drawGlowElement(() => {
                ctx.fillStyle = Colors.PADDLE_RIGHT;
                ctx.fillRect(Canvas.WIDTH - 50 - paddleWidth, paddleY, paddleWidth, paddleHeight);
            }, Colors.PADDLE_RIGHT);

            ctx.globalAlpha = 1.0;
        };

        const drawGameResult = (userSide?: "left" | "right", winner?: "left" | "right" | null) => {
            if (!winner || !userSide) return;

            const isWinner = winner === userSide;
            const text = isWinner ? "You Win" : "You Lose";
            const color = isWinner ? "#10b981" : "#ef4444";

            ctx.fillStyle = color;
            ctx.font = "bold 64px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, Canvas.WIDTH / 2, Canvas.HEIGHT / 2);
        };

        const renderFrame = (timestamp: number) => {
            animationTimeRef.current = timestamp;
            const currentGameState = gameStateRef.current;
            ctx.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);

            drawBackground();

            if (waiting) {
                drawCenterLine();
                drawWaitingState(timestamp);
            } else if (currentGameState) {
                drawCenterLine();
                drawScore(currentGameState);

                if (!isGameOver) {
                    drawPaddles(currentGameState);
                    drawBall(currentGameState);
                } else {
                    drawGameResult(userSide, winner);
                }
            }

            // Draw countdown **always on top** if active
            if (countdown !== null && countdown > 0) {
                drawCountdown(countdown);
            }

            animationFrameId = requestAnimationFrame(renderFrame);
        };

        renderFrame(0);

        return () => { cancelAnimationFrame(animationFrameId); };
    }, [gameStateRef, isGameOver, countdown, waiting, userSide, winner]);

    return (
        <canvas
            ref={canvasRef}
            width={Canvas.WIDTH}
            height={Canvas.HEIGHT}
            className="w-full aspect-video"
        />
    );
}

