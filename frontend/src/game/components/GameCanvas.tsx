import { useEffect, useRef } from "react";
import { Side, GameState } from "../types/types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const COLORS = {
    bg: "#111",
    line: "#444",
    ball: "#FFFFFF",
    overlay: "rgba(17,17,17,0.85)",
    overlayGameOver: "rgba(17,17,17,0.9)",
    countdownCircle: "#222",
    countdownBorder: "#FFD600",
    countdownText: "#FFD600",
    gameOverText: "#FFD600",
};

const PADDLE_COLORS: Record<Side, string> = {
    left: "#FFFFFF",
    right: "#AAAAAA",
    top: "#66CCFF",
    bottom: "#FF8888",
};

interface GameCanvasProps {
    gameStateRef: React.MutableRefObject<GameState | null>;
    isGameOver: boolean;
    countdown: number | null;
    side: Side | null;
}

export default function GameCanvas({ gameStateRef, isGameOver, countdown }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let frameId = 0;

        const drawBackground = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = COLORS.bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const drawCenterLines = (state: GameState | null) => {
            ctx.save();
            ctx.setLineDash([12, 12]);
            ctx.strokeStyle = COLORS.line;
            ctx.lineWidth = 3;

            // Vertical line (common for 2 or 4 players)
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            // Horizontal line only if top/bottom paddles exist (4 players)
            const hasTopBottom = Boolean(state?.paddles.top || state?.paddles.bottom);
            if (hasTopBottom) {
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
            }

            ctx.restore();
        };

        const drawPaddles = (state: GameState) => {
            Object.entries(state.paddles).forEach(([key, paddle]) => {
                if (!paddle)
                    return;
                const side = key as Side;
                ctx.fillStyle = PADDLE_COLORS[side] || "#777";
                ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
            });
        };

        const drawBall = (state: GameState) => {
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.ball;
            ctx.fill();
        };

        const drawCountdownOverlay = (value: number) => {
            // Dim overlay
            ctx.fillStyle = COLORS.overlay;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center circle
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 80, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.countdownCircle;
            ctx.fill();
            ctx.lineWidth = 6;
            ctx.strokeStyle = COLORS.countdownBorder;
            ctx.stroke();

            // Number
            ctx.fillStyle = COLORS.countdownText;
            ctx.font = "bold 72px 'Share Tech Mono', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(value.toString(), cx, cy);
        };

        const drawGameOverOverlay = () => {
            ctx.fillStyle = COLORS.overlayGameOver;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = COLORS.gameOverText;
            ctx.font = "bold 48px 'Share Tech Mono', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        };

        const drawFrame = () => {
            drawBackground();

            const state = gameStateRef.current;

            if (!isGameOver && countdown !== null) {
                drawCountdownOverlay(countdown);
            } else {
                if (state && !isGameOver) {
                    drawCenterLines(state);
                    drawPaddles(state);
                    drawBall(state);
                }
                if (isGameOver) {
                    drawGameOverOverlay();
                }
            }

            frameId = requestAnimationFrame(drawFrame);
        };

        drawFrame();
        return () => cancelAnimationFrame(frameId);
    }, [gameStateRef, isGameOver, countdown]);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full rounded-xl bg-black border-2 border-gray-900"
        />
    );
}
