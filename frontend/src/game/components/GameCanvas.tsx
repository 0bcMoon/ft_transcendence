import { useEffect, useRef } from "react";
import { Side, GameState } from "../types/types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BACKGROUND_COLOR = "#111"; // Match black header
const BALL_COLOR = "#FFFFFF"; // Yellow arcade ball
const LINE_COLOR = "#444"; // Dim white/gray
const PADDLE_COLORS: Record<Side, string> = {
    left: "#FFF",   // White
    right: "#AAA"   // Light gray for right paddle
};
const COUNTDOWN_OVERLAY = "rgba(17,17,17,0.85)"; // Dark overlay
const COUNTDOWN_CIRCLE_COLOR = "#222";
const COUNTDOWN_BORDER_COLOR = "#FFD600";
const COUNTDOWN_TEXT_COLOR = "#FFD600";
const COUNTDOWN_FONT = "bold 72px 'Share Tech Mono', monospace";
const GAME_OVER_OVERLAY = "rgba(17,17,17,0.9)";

interface GameCanvasProps {
    gameStateRef: React.MutableRefObject<GameState | null>;
    side: Side | null;
    isGameOver: boolean;
    countdown: number | null;
}

export default function GameCanvas({
    gameStateRef,
    side,
    isGameOver,
    countdown,
}: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;

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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = BACKGROUND_COLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const state = gameStateRef.current;

            // Countdown overlay
            if (countdown !== null && countdown !== undefined && !isGameOver) {
                // Black overlay
                ctx.fillStyle = COUNTDOWN_OVERLAY;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Yellow circle in center
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
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

                frameId = requestAnimationFrame(draw);
                return;
            }

            // Draw game if not game over
            if (state && !isGameOver) {
                // Center dashed line
                ctx.beginPath();
                ctx.setLineDash([12, 12]);
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.strokeStyle = LINE_COLOR;
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.setLineDash([]);

                // Paddles
                Object.entries(state.paddles).forEach(([pSide, paddle]) => {
                    if (!paddle)
                        return;
                    ctx.fillStyle = PADDLE_COLORS[pSide as Side] || "#555";
                    drawRoundedRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
                });

                // Ball
                ctx.beginPath();
                ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = BALL_COLOR;
                ctx.fill();
            }

            // Game over overlay
            if (isGameOver) {
                ctx.fillStyle = GAME_OVER_OVERLAY;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "#FFD600";
                ctx.font = "bold 48px 'Share Tech Mono', monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
            }

            frameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(frameId);
    }, [gameStateRef, side, isGameOver, countdown]);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full rounded-xl bg-black border-2 border-gray-900"
        />
    );
}
