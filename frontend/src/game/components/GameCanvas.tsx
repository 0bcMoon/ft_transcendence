import React, { useEffect } from 'react';
import { Ball, GameState } from '../engine/types';

interface GameCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    ball: Ball;
    player1Y: number;
    player2Y: number;
    paddleWidth: number;
    paddleHeight: number;
    gameState: GameState;
}

const GameCanvas = ({ canvasRef, ball, player1Y, player2Y, paddleWidth, paddleHeight, gameState }: GameCanvasProps) => {

    useEffect(() => { drawCanvas(); });

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw center line
        ctx.beginPath();
        ctx.setLineDash([15, 15]);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw player names
        ctx.font = '24px "Courier New", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.player1, width / 4, 30);
        ctx.fillText(gameState.player2, 3 * width / 4, 30);

        // Draw scores
        ctx.font = '64px "Courier New", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.scores.player1.toString(), width / 4, 90);
        ctx.fillText(gameState.scores.player2.toString(), 3 * width / 4, 90);

        // Draw paddles
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(30, player1Y, paddleWidth, paddleHeight);
        ctx.fillRect(width - 30 - paddleWidth, player2Y, paddleWidth, paddleHeight);

        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.position.x, ball.position.y, ball.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

    };

    return (
        <canvas
            ref={canvasRef}
            className="border border-gray-800 max-h-screen"
            style={{
                aspectRatio: '4/3',
                maxWidth: '100vw',
                maxHeight: '100vh',
                objectFit: 'contain'
            }}
        />
    );
};

export default GameCanvas;
