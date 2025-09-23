import { useEffect, useRef } from "react";
import { Side, GameState } from "../types/types";
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    BACKGROUND_COLOR,
    BALL_COLOR,
    LINE_COLOR,
    PADDLE_COLORS,
    COUNTDOWN_OVERLAY,
    COUNTDOWN_CIRCLE_COLOR,
    COUNTDOWN_BORDER_COLOR,
    COUNTDOWN_TEXT_COLOR,
    SCORE_FONT,
    COUNTDOWN_FONT,
    GAME_OVER_OVERLAY,
} from "../utils/constants";

interface GameCanvasProps {
    gameStateRef: React.MutableRefObject<GameState | null>;
    side: Side | null;
    isGameOver: boolean;
    countdown: number | null;
}

export default function GameCanvas({ gameStateRef, side, isGameOver, countdown }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let frameId: number;

        const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
        };

        const draw = () => {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = BACKGROUND_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center line
            ctx.beginPath();
            ctx.setLineDash([15, 15]);
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.strokeStyle = LINE_COLOR;
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.setLineDash([]);

            const state = gameStateRef.current;

            if (state && !isGameOver) {
                // Paddles
                Object.entries(state.paddles).forEach(([pSide, paddle]) => {
                    if (!paddle) return;
                    ctx.fillStyle = PADDLE_COLORS[pSide as Side] || LINE_COLOR;
                    drawRoundedRect(paddle.x, paddle.y, paddle.width, paddle.height, 4);
                });

                // Ball
                ctx.beginPath();
                ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = BALL_COLOR;
                ctx.fill();

                // Scores
                ctx.font = SCORE_FONT;
                ctx.textAlign = "center";
                if (state.score.left !== undefined) {
                    ctx.fillStyle = side === "left" ? BALL_COLOR : LINE_COLOR;
                    ctx.fillText(state.score.left.toString(), canvas.width / 4, 40);
                }
                if (state.score.right !== undefined) {
                    ctx.fillStyle = side === "right" ? BALL_COLOR : LINE_COLOR;
                    ctx.fillText(state.score.right.toString(), (canvas.width * 3) / 4, 40);
                }
            }

            // Countdown
            if (countdown && !isGameOver) {
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                ctx.fillStyle = COUNTDOWN_OVERLAY;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.arc(cx, cy, 80, 0, Math.PI * 2);
                ctx.fillStyle = COUNTDOWN_CIRCLE_COLOR;
                ctx.fill();
                ctx.lineWidth = 6;
                ctx.strokeStyle = COUNTDOWN_BORDER_COLOR;
                ctx.stroke();

                ctx.fillStyle = COUNTDOWN_TEXT_COLOR;
                ctx.font = COUNTDOWN_FONT;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(countdown.toString(), cx, cy);
            }

            // Game over overlay
            if (isGameOver) {
                ctx.fillStyle = GAME_OVER_OVERLAY;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            frameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(frameId);
    }, [gameStateRef, side, isGameOver, countdown]);

    return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full rounded-lg shadow-sm" />;
}

