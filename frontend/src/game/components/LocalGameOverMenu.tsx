interface LocalGameOverMenuProps {
    winner: "left" | "right" | null;
    score: { left: number; right: number } | undefined;
    playerNames: { left: string; right: string };
    onPlayAgain: () => void;
    onExit: () => void;
}

export default function LocalGameOverMenu({
    winner,
    score,
    playerNames,
    onPlayAgain,
    onExit,
}: LocalGameOverMenuProps) {
    const winnerName = winner ? playerNames[winner] : "Unknown";

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm space-y-6 animate-fadeIn text-white">
            <h2 className="text-5xl font-bold drop-shadow-lg text-green-400">
                🏆 {winnerName} Wins
            </h2>
            <p className="text-xl text-gray-300">
                Final Score: {score?.left} - {score?.right}
            </p>
            <div className="flex space-x-4">
                <button
                    onClick={onPlayAgain}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold shadow-md transition"
                >
                    Play Again
                </button>
                <button
                    onClick={onExit}
                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 rounded-lg text-white font-semibold shadow-md transition"
                >
                    Exit to Home
                </button>
            </div>
        </div>
    );
}

