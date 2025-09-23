import { Trophy, RotateCcw, Home } from "lucide-react";

type GameOverScreenProps = {
    winnerSide: boolean; // whether the current side won
    finalScore: { left: number; right: number };
    playerNames: { left: string; right: string };
    handlePlayAgain: () => void;
    handleGoHome: () => void;
};

export default function GameOverScreen({
    winnerSide,
    finalScore,
    playerNames,
    handlePlayAgain,
    handleGoHome,
}: GameOverScreenProps) {
    return (
        <div className="bg-white p-8 text-center max-w-md mx-auto">
            {/* Trophy/Result Icon */}
            <div className="mb-6">
                <div
                    className={`inline-flex p-6 rounded-full ${winnerSide ? "bg-green-50" : "bg-gray-50"
                        }`}
                >
                    <Trophy
                        size={48}
                        className={winnerSide ? "text-green-500" : "text-gray-400"}
                    />
                </div>
            </div>

            {/* Result Message */}
            <h2
                className={`text-2xl font-bold mb-2 ${winnerSide ? "text-green-600" : "text-gray-600"
                    }`}
            >
                {winnerSide ? "Victory!" : "Defeat"}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
                {winnerSide ? "Great job! You won the match." : "Better luck next time!"}
            </p>

            {/* Final Score */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Final Score
                </div>
                <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{finalScore.left}</div>
                        <div className="text-xs text-gray-500 mt-1">{playerNames.left}</div>
                    </div>
                    <div className="text-gray-300 text-xl">:</div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{finalScore.right}</div>
                        <div className="text-xs text-gray-500 mt-1">{playerNames.right}</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={handlePlayAgain}
                    className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <RotateCcw size={18} />
                    <span>Play Again</span>
                </button>
                <button
                    onClick={handleGoHome}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                    <Home size={18} />
                    <span>Home</span>
                </button>
            </div>
        </div>
    );
}

