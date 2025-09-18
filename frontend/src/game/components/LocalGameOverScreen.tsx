import { Trophy, Gamepad2 } from "lucide-react";

export default function LocalGameOverScreen({ game, navigate }: { game: any; navigate: any }) {
    const { winner, finalScore, playerNames } = game;

    const winnerName = winner ? playerNames[winner] : "No one";

    return (
        <div className="p-8 text-center">
            <div className="inline-flex p-4 rounded-full mb-6 bg-yellow-100">
                <Trophy size={32} className="text-yellow-600" />
            </div>

            <p className="text-gray-700 font-semibold mb-6">
                {winner ? `${winnerName} won the match!` : "It's a draw!"}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-xs mx-auto">
                <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {finalScore.left}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{playerNames.left}</div>
                    </div>
                    <div className="text-gray-400">-</div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {finalScore.right}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{playerNames.right}</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={game.handlePlayAgain}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-all flex items-center justify-center"
                >
                    <Gamepad2 size={18} className="mr-2" />
                    Play Again
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-all"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

