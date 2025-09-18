import { useEffect, useRef } from "react";
import { GameSession, Side } from "../types/types";

interface GameCanvasProps {
    game: GameSession;
}

const PADDLE_COLORS: Partial<Record<Side, string>> = {
    left: "#3b82f6",
    right: "#6366f1",
    top: "#ec4899",
    bottom: "#10b981"
};

export default function GameCanvas({ game }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let frameId: number;

        function draw() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Center line (always vertical for 1v1, can extend for other modes)
            ctx.beginPath();
            ctx.setLineDash([15, 15]);
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.setLineDash([]);

            const state = game.gameStateRef.current;

            if (state && !game.isGameOver && !game.waiting) {
                // Draw paddles for all present sides
                Object.entries(state.paddles).forEach(([side, paddle]) => {
                    if (!paddle) return;
                    ctx.fillStyle = PADDLE_COLORS[side as Side] || "#94a3b8";
                    drawRoundedRect(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 4);
                });

                // Draw ball
                ctx.beginPath();
                ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = "#f9fafb";
                ctx.fill();

                // Draw scores for all present sides
                ctx.font = "32px Arial";
                ctx.textAlign = "center";
                // For 1v1, show left/right scores; for 4p, you can extend this
                if (state.score.left !== undefined) {
                    ctx.fillStyle = game.side === "left" ? "#f9fafb" : "#94a3b8";
                    ctx.fillText(state.score.left.toString(), canvas.width / 4, 40);
                }
                if (state.score.right !== undefined) {
                    ctx.fillStyle = game.side === "right" ? "#f9fafb" : "#94a3b8";
                    ctx.fillText(state.score.right.toString(), (canvas.width * 3) / 4, 40);
                }
            }

            // Countdown
            if (game.countdown && !game.isGameOver) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                ctx.fillStyle = "rgba(30,41,59,0.8)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
                ctx.fillStyle = "#1e293b";
                ctx.fill();
                ctx.lineWidth = 6;
                ctx.strokeStyle = "#3b82f6";
                ctx.stroke();

                ctx.fillStyle = "#ec4899";
                ctx.font = "bold 64px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(game.countdown.toString(), centerX, centerY);
            }

            // Game over overlay
            if (game.isGameOver) {
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            frameId = requestAnimationFrame(draw);
        }

        function drawRoundedRect(
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            width: number,
            height: number,
            radius: number
        ) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }

        draw();
        return () => cancelAnimationFrame(frameId);
    }, [game]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full rounded-lg shadow-sm"
        />
    );
}
