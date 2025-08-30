interface GameOverMenuProps {
    winner: "left" | "right" | null;
    side: "left" | "right" | null;
    score: { left: number; right: number } | undefined;
    onPlayAgain: () => void;
    onExit: () => void;
}

export default function GameOverMenu({
    winner,
    side,
    score,
    onPlayAgain,
    onExit,
}: GameOverMenuProps) {
    const didWin = winner === side;

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6 text-center text-white space-y-6">
                <h2 className={`text-4xl font-bold drop-shadow ${didWin ? "text-green-400" : "text-pink-400"}`}>
                    {didWin ? "🏆 Victory!" : "💀 Defeat"}
                </h2>

                <p className="text-lg text-gray-300">
                    Final Score: <span className="font-semibold text-white">{score?.left}</span> - <span className="font-semibold text-white">{score?.right}</span>
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                    <button
                        onClick={onPlayAgain}
                        className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold shadow-lg transition duration-200"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={onExit}
                        className="px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 rounded-lg text-white font-semibold shadow-lg transition duration-200"
                    >
                        Exit to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

