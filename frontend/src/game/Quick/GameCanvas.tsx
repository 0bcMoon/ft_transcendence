import { useEffect, useRef } from "react";
import { GameState } from "./game.protocol";

export const GameCanvas: React.FC<{ gameState: GameState }> = ({
    gameState,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            const maxWidth = 800;
            const maxHeight = 600;
            const parentWidth = parent.clientWidth * 0.9;
            const parentHeight = parent.clientHeight * 0.8;

            let width = Math.min(parentWidth, maxWidth);
            let height = width * 0.75;

            if (height > parentHeight) {
                height = parentHeight;
                width = height * (4 / 3);
            }

            canvas.width = width;
            canvas.height = height;
        };

        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            const { width, height } = canvas;

            // Clear canvas
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, width, height);

            // Calculate scale
            const scale = Math.min(width / 800, height / 600);
            const offsetX = (width - 800 * scale) / 2;
            const offsetY = (height - 600 * scale) / 2;

            // Save context
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);

            // Draw center line
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(400, 0);
            ctx.lineTo(400, 600);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw paddles
            ctx.fillStyle = "#fff";
            ctx.fillRect(32, gameState.paddle1Y, 12, 80);
            ctx.fillRect(756, gameState.paddle2Y, 12, 80);

            // Draw ball
            ctx.beginPath();
            ctx.arc(gameState.ballX, gameState.ballY, 12, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();

            // Draw scores
            ctx.font = "bold 48px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText(gameState.score1.toString(), 320, 60);
            ctx.fillText(gameState.score2.toString(), 480, 60);

            // Restore context
            ctx.restore();
        };

        // Initial draw
        draw();

        // Clean up
        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [gameState]);

    return (
        <canvas
            ref={canvasRef}
            className="border border-gray-700 rounded"
            style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                display: "block",
                margin: "0 auto",
            }}
        />
    );
};
