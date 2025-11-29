import { Trophy, ThumbsDown, Gamepad2, Home } from "lucide-react";
import { Side, Scores, PlayerNames } from "../../types/types";
import { NavigateFunction } from "react-router-dom";

interface LocalGameOverScreenProps {
    winner: Side | null;
    finalScore: Scores;
    playerNames: PlayerNames;
    handlePlayAgain: () => void;
    navigate: NavigateFunction;
    userSide: Side; // 'left' or 'right'
}

function LocalGameOverScreen({
    winner,
    finalScore,
    playerNames,
    handlePlayAgain,
    navigate,
    userSide,
}: LocalGameOverScreenProps) {
    const leftName = playerNames.left ?? "Player 1";
    const rightName = playerNames.right ?? "Player 2";
    const leftScore = finalScore.left ?? 0;
    const rightScore = finalScore.right ?? 0;

    // Result
    let resultText = "It's a Draw!";
    let resultIcon = <Trophy size={40} className="text-gray-500 dark:text-gray-300" />;
    let resultColor = "text-gray-700 dark:text-gray-200";

    if (winner) {
        if (userSide === winner) {
            resultText = "You Win!";
            resultIcon = <Trophy size={40} className="text-green-600 dark:text-green-400" />;
            resultColor = "text-green-600 dark:text-green-400";
        } else {
            resultText = "You Lose!";
            resultIcon = <ThumbsDown size={40} className="text-red-600 dark:text-red-400" />;
            resultColor = "text-red-600 dark:text-red-400";
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="flex flex-col items-center gap-8 w-full max-w-md p-8 sm:p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                {/* Result Icon */}
                <div className="mb-2 flex justify-center">
                    {resultIcon}
                </div>
                {/* Result Text */}
                <h1 className={`text-4xl sm:text-5xl font-extrabold mb-6 ${resultColor}`}>{resultText}</h1>

                {/* Score */}
                <div className="flex items-center justify-center gap-9 mb-8">
                    <div className="flex flex-col items-center">
                        <span className={`text-3xl sm:text-4xl font-bold ${winner === "left" ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-200"}`}>
                            {leftScore}
                        </span>
                        <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-semibold">{leftName}</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-bold text-gray-400 dark:text-gray-500">-</span>
                    <div className="flex flex-col items-center">
                        <span className={`text-3xl sm:text-4xl font-bold ${winner === "right" ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-200"}`}>
                            {rightScore}
                        </span>
                        <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-semibold">{rightName}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-5 flex-col sm:flex-row justify-center">
                    <button
                        onClick={handlePlayAgain}
                        className="flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white text-lg sm:text-xl font-semibold py-3 px-7 rounded-lg transition"
                    >
                        <Gamepad2 size={20} />
                        Play Again
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-lg sm:text-xl font-semibold py-3 px-7 rounded-lg transition"
                    >
                        <Home size={20} />
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LocalGameOverScreen;
