import React, { useEffect, useRef } from 'react';
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

const GameCanvas: React.FC<GameCanvasProps> = ({
	canvasRef,
	ball,
	player1Y,
	player2Y,
	paddleWidth,
	paddleHeight,
	gameState
}) => {
	// Setup canvas rendering on each update
	useEffect(() => {
		drawCanvas();
	});

	// Draw the game elements
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

		// Draw scores
		ctx.font = '64px "Courier New", monospace';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.fillText(gameState.scores.player1.toString(), width / 4, 80);
		ctx.fillText(gameState.scores.player2.toString(), 3 * width / 4, 80);

		// Draw player 1 paddle
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(30, player1Y, paddleWidth, paddleHeight);

		// Draw player 2 paddle
		ctx.fillRect(width - 30 - paddleWidth, player2Y, paddleWidth, paddleHeight);

		// Draw ball
		ctx.fillRect(
			ball.position.x - ball.size / 2,
			ball.position.y - ball.size / 2,
			ball.size,
			ball.size
		);

		// Draw current time
		ctx.font = '12px "Courier New", monospace';
		ctx.fillStyle = '#888888';
		ctx.textAlign = 'center';
		const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
		ctx.fillText(currentTime, width / 2, height - 10);

		// Draw game over overlay if needed
		if (gameState.isGameOver) {
			// Semi-transparent overlay
			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.fillRect(0, 0, width, height);

			// Game over text
			ctx.font = '64px "Courier New", monospace';
			ctx.fillStyle = '#FFFFFF';
			ctx.textAlign = 'center';
			ctx.fillText('GAME OVER', width / 2, height / 2 - 40);

			// Winner text
			ctx.font = '36px "Courier New", monospace';
			ctx.fillText(`${gameState.winner} WINS`, width / 2, height / 2 + 30);
		}
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
