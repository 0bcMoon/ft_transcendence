import { useEffect, useRef } from "react";

import { RemoteGame } from "../types/types";

type GameCanvasProps = {
    game: RemoteGame;
};

export default function GameCanvas(props: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const colors = {
            background: "#1e293b",
            paddle: {
                left: "#3b82f6",
                right: "#6366f1"
            },
            ball: "#f9fafb",
            centerLine: "#94a3b8",
            score: {
                default: "#94a3b8",
                highlight: "#f9fafb"
            },
            countdown: {
                overlay: "rgba(30, 41, 59, 0.8)",
                circle: "#1e293b",
                border: "#3b82f6",
                text: "#ec4899"
            }
        };

        let frameId: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, "rgba(59, 130, 246, 0.05)"); // Blue with opacity
            gradient.addColorStop(1, "rgba(99, 102, 241, 0.05)"); // Indigo with opacity
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const state = props.game.gameStateRef.current;

            if (!props.game.waiting) {
                if (!props.game.isGameOver && props.game.countdown === null && state) {
                    ctx.beginPath();
                    ctx.setLineDash([15, 15]);
                    ctx.moveTo(canvas.width / 2, 0);
                    ctx.lineTo(canvas.width / 2, canvas.height);
                    ctx.strokeStyle = colors.centerLine;
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                if (state && !props.game.isGameOver) {
                    const { paddles, ball, score } = state;

                    ctx.fillStyle = colors.paddle.left;
                    drawRoundedRect(ctx, paddles.left.x, paddles.left.y, paddles.left.width, paddles.left.height, 4);

                    ctx.fillStyle = colors.paddle.right;
                    drawRoundedRect(ctx, paddles.right.x, paddles.right.y, paddles.right.width, paddles.right.height, 4);

                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                    ctx.fillStyle = colors.ball;
                    ctx.fill();

                    ctx.font = "32px Arial";
                    ctx.textAlign = "center";

                    ctx.fillStyle = props.game.side === "left" ? colors.score.highlight : colors.score.default;
                    ctx.fillText(score.left.toString(), canvas.width / 4, 40);

                    ctx.fillStyle = props.game.side === "right" ? colors.score.highlight : colors.score.default;
                    ctx.fillText(score.right.toString(), canvas.width / 2 + canvas.width / 4, 40);
                }

                if (props.game.countdown && !props.game.isGameOver) {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;

                    ctx.fillStyle = colors.countdown.overlay;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
                    ctx.fillStyle = colors.countdown.circle;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = colors.countdown.border;
                    ctx.stroke();

                    ctx.fillStyle = colors.countdown.text;
                    ctx.font = "bold 64px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(props.game.countdown.toString(), centerX, centerY);
                }

                if (props.game.isGameOver) {
                    ctx.fillStyle = "rgba(0,0,0,0.7)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#fff";
                    ctx.font = "48px Arial";
                    ctx.textAlign = "center";
                }
            }

            frameId = requestAnimationFrame(draw);
        };

        // Helper function for drawing rounded rectangles
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
    }, [props.game]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full rounded-lg shadow-sm"
        />
    );
}
