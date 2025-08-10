export interface Vector2D {
	x: number;
	y: number;
}

export interface Ball {
	position: Vector2D;
	size: number;
	velocity: Vector2D;
}

export interface Paddle {
	width: number;
	height: number;
	position: Vector2D;
	speed: number;
}

export interface GameState {
	player1: string;
	player2: string;
	isGameOver: boolean;
	winner: string | null;
	scores: {
		player1: number;
		player2: number;
	};
}

export interface KeyState {
	w: boolean;
	s: boolean;
	arrowUp: boolean;
	arrowDown: boolean;
}

export interface GameConfig {
	canvasWidth: number;
	canvasHeight: number;
	winningScore: number;
	winMargin: number;
	paddleOffset: number;
	paddleHeight: number;
	initialBallSpeed: number;
	initialBallAngle: number;
	ballSpeedIncrease: number;
	paddleHitAngleFactor: number;
}
