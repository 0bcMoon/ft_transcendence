import React from 'react';
import { GameState } from '../types';

interface GameOverProps {
	gameState: GameState;
	score1: number;
	score2: number;
	playAgain: () => void;
	goBack: () => void;
	changePlayers: () => void;
}

const GameOver: React.FC<GameOverProps> = ({
	gameState,
	score1,
	score2,
	playAgain,
	goBack,
	changePlayers
}) => {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10 p-4">
			<div className="bg-black border-4 border-white p-10 max-w-md w-full text-center">
				<h2 className="text-white text-5xl font-mono mb-8">GAME OVER</h2>
				<p className="text-white text-3xl font-mono mb-10">
					{gameState.winner} WINS
				</p>

				<div className="grid grid-cols-2 gap-6 text-2xl font-mono mb-10">
					<div className="text-center">
						<p className="text-sm text-gray-400 mb-1">{gameState.player1}</p>
						<p className="text-4xl text-white">{score1}</p>
					</div>
					<div className="text-center">
						<p className="text-sm text-gray-400 mb-1">{gameState.player2}</p>
						<p className="text-4xl text-white">{score2}</p>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row justify-center gap-6 text-2xl font-mono">
					<button
						onClick={playAgain}
						className="bg-black border-2 border-white text-white py-3 px-8 hover:bg-white hover:text-black transition-colors"
					>
						PLAY AGAIN
					</button>
					<button
						onClick={goBack}
						className="bg-black border-2 border-white text-white py-3 px-8 hover:bg-white hover:text-black transition-colors"
					>
						MAIN MENU
					</button>
				</div>

				<button
					onClick={changePlayers}
					className="mt-6 text-gray-400 hover:text-white text-sm underline"
				>
					Change Players
				</button>
			</div>
		</div>
	);
};

export default GameOver;
