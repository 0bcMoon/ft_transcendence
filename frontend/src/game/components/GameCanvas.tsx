import { useEffect, useRef } from "react";
import { GameState } from "../types/types";

interface GameCanvasProps {
    gameStateRef: React.MutableRefObject<GameState | null>;
    countdown: number | null;
    isGameOver: boolean;
    winner: "left" | "right" | null;
    side: "left" | "right" | null;
    waiting: boolean;
}

export default function GameCanvas({
    gameStateRef,
    countdown,
    isGameOver,
    winner,
    side,
    waiting,
}: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let frameId: number;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, width, height);

            const state = gameStateRef.current;

            if (!waiting) {
                if (!isGameOver && countdown === null && state) {
                    ctx.beginPath();
                    ctx.setLineDash([15, 15]);
                    ctx.moveTo(width / 2, 0);
                    ctx.lineTo(width / 2, height);
                    ctx.strokeStyle = "#FFFFFF";
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                if (state && !isGameOver && !countdown) {
                    const { paddles, ball, score } = state;

                    ctx.fillStyle = "#fff";
                    ctx.fillRect(paddles.left.x, paddles.left.y, paddles.left.width, paddles.left.height);
                    ctx.fillRect(paddles.right.x, paddles.right.y, paddles.right.width, paddles.right.height);

                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.font = "32px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(score.left.toString(), width / 2 - 60, 40);
                    ctx.fillText(score.right.toString(), width / 2 + 60, 40);
                }

                if (countdown && !isGameOver) {
                    const centerX = width / 2;
                    const centerY = height / 2;

                    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                    ctx.fillRect(0, 0, width, height);

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

                if (isGameOver) {
                    ctx.fillStyle = "rgba(0,0,0,0.7)";
                    ctx.fillRect(0, 0, width, height);
                    ctx.fillStyle = "#fff";
                    ctx.font = "48px Arial";
                    ctx.textAlign = "center";
                }
            }

            frameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(frameId);
    }, [gameStateRef, countdown, isGameOver, winner, side, waiting]);

    return (
        <div className="w-full max-w-screen-md aspect-[4/3] relative rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                width={800}
                height={600}
            />
        </div>
    );
}

