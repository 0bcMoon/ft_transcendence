import { GameState } from '../engine/types';

interface PauseMenuProps {
    gameState: GameState;
    onResume: () => void;
    onQuit: () => void;
}

const PauseMenu = ({ gameState, onResume, onQuit }: PauseMenuProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10 p-4">
            <div className="bg-black border-4 border-white p-10 max-w-md w-full text-center">
                <h2 className="text-white text-5xl font-mono mb-8">PAUSED</h2>

                <div className="grid grid-cols-2 gap-6 text-2xl font-mono mb-10">
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">{gameState.player1}</p>
                        <p className="text-4xl text-white">{gameState.scores.player1}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">{gameState.player2}</p>
                        <p className="text-4xl text-white">{gameState.scores.player2}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-6 text-2xl font-mono">
                    <button
                        onClick={onResume}
                        className="bg-black border-2 border-white text-white py-3 px-8 hover:bg-white hover:text-black transition-colors"
                    >
                        RESUME
                    </button>
                    <button
                        onClick={onQuit}
                        className="bg-black border-2 border-white text-white py-3 px-8 hover:bg-white hover:text-black transition-colors"
                    >
                        QUIT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PauseMenu;
