import React, { useEffect, useRef } from "react";
import { GameState } from "../types/types";
import { Canvas, Colors, Fonts } from "../utils/gameConfig";

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

        if (!canvas || !ctx) {
            console.error("Canvas rendering context not found.");
            return;
        }

        let animationFrameId: number;

        const drawBackground = () => {
            ctx.fillStyle = Colors.BACKGROUND;
            ctx.fillRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
        };

        const drawCenterLine = () => {
            ctx.save();
            ctx.setLineDash([8, 8]);
            ctx.strokeStyle = Colors.LINES;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(Canvas.WIDTH / 2, 5);
            ctx.lineTo(Canvas.WIDTH / 2, Canvas.HEIGHT - 5);
            ctx.stroke();
            ctx.restore();
        };

        const drawPaddles = (state: GameState) => {
            if (state.leftPaddle) {
                ctx.fillStyle = Colors.PADDLE_LEFT;
                ctx.fillRect(state.leftPaddle.x, state.leftPaddle.y, state.leftPaddle.width, state.leftPaddle.height);
            }
            if (state.rightPaddle) {
                ctx.fillStyle = Colors.PADDLE_RIGHT;
                ctx.fillRect(state.rightPaddle.x, state.rightPaddle.y, state.rightPaddle.width, state.rightPaddle.height);
            }
        };

        const drawBall = (state: GameState) => {
            ctx.fillStyle = Colors.BALL;
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
            ctx.fill();
        };

        const drawCountdownOverlay = (value: number) => {
            ctx.fillStyle = Colors.OVERLAY_COUNTDOWN; // e.g., rgba(17, 24, 39, 0.75)
            ctx.fillRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);

            const circleRadius = 70; // Adjust size as needed
            const centerX = Canvas.WIDTH / 2;
            const centerY = Canvas.HEIGHT / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
            ctx.strokeStyle = Colors.COUNTDOWN_TEXT;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = Colors.COUNTDOWN_TEXT;
            ctx.font = Fonts.COUNTDOWN;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(value.toString(), centerX, centerY);
        };

        const renderFrame = () => {
            drawBackground();

            const currentGameState = gameStateRef.current;

            if (countdown !== null) {
                drawCountdownOverlay(countdown);
            } else if (currentGameState) {
                drawBall(currentGameState);
                drawCenterLine();
                drawPaddles(currentGameState);
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
            className="w-full rounded-lg border border-gray-700 shadow-inner"
        />
    );
}
