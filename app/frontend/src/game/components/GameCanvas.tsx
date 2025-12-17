import React, { useEffect, useRef } from "react";
import { GameState } from "../types/types";
import { Canvas, Effects, Colors, Fonts } from "../utils/gameConfig";

interface GameCanvasProps {
    gameStateRef: React.MutableRefObject<GameState | null>;
    isGameOver: boolean;
    countdown: number | null;
}

export default function GameCanvas({ gameStateRef, isGameOver, countdown }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        // Helper to draw elements with a neon glow
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

        const renderFrame = () => {
            ctx.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
            drawBackground();

            const currentGameState = gameStateRef.current;

            if (currentGameState && !isGameOver) {
                drawCenterLine();
                drawScore(currentGameState);
                drawPaddles(currentGameState);
                drawBall(currentGameState);
            }

            if (countdown !== null && countdown > 0) {
                drawCountdown(countdown);
            }

            animationFrameId = requestAnimationFrame(renderFrame);
        };

        renderFrame();

        return () => { cancelAnimationFrame(animationFrameId); };
    }, [gameStateRef, isGameOver, countdown]);

    return (
        <canvas
            ref={canvasRef}
            width={Canvas.WIDTH}
            height={Canvas.HEIGHT}
            // This makes the canvas responsive while maintaining its aspect ratio.
            // The parent div will handle rounding, borders, and shadows.
            className="w-full aspect-video"
        />
    );
}
