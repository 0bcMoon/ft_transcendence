import { useEffect, useRef } from "react";
import { GameState } from "../types/types";

interface GameCanvasProps {
    gameStateRef: React.MutableRefObject<GameState | null>;
    countdown: number | null;
    isGameOver: boolean;
    winner: "left" | "right" | null;
    side: "left" | "right" | null;
}

export default function GameCanvas({
    gameStateRef,
    countdown,
    isGameOver,
    winner,
    side,
}: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let frameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Always draw black background
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const state = gameStateRef.current;

            // Draw dashed center line only during active gameplay
            if (!isGameOver && countdown === null && state) {
                ctx.beginPath();
                ctx.setLineDash([15, 15]);
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw game elements only during active gameplay
            if (state && !isGameOver) {
                const { paddles, ball, score } = state;

                ctx.fillStyle = "#fff";
                ctx.fillRect(paddles.left.x, paddles.left.y, paddles.left.width, paddles.left.height);
                ctx.fillRect(paddles.right.x, paddles.right.y, paddles.right.width, paddles.right.height);

                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = "32px Arial";
                ctx.textAlign = "center";
                ctx.fillText(score.left.toString(), canvas.width / 2 - 60, 40);
                ctx.fillText(score.right.toString(), canvas.width / 2 + 60, 40);
            }

            if (countdown && !isGameOver) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
                ctx.fillStyle = "#000";
                ctx.fill();

                ctx.lineWidth = 6;
                ctx.strokeStyle = "#fff";
                ctx.stroke();

                ctx.fillStyle = "#ec4899";
                ctx.font = "bold 64px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(countdown.toString(), centerX, centerY);
            }

            if (isGameOver && countdown === null && side) {

                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#fff";
                ctx.font = "48px Arial";
                ctx.textAlign = "center";
            }

            frameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(frameId);
    }, [gameStateRef, countdown, isGameOver, winner, side]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="rounded-lg shadow-2xl border-4 border-gray-700"
        />
    );
}

