import { Trophy, RotateCcw, Home } from "lucide-react";

type Side4 = "left" | "right" | "top" | "bottom";

type Scores4 = Partial<Record<Side4, number>>;
type Names4 = Partial<Record<Side4, string>>;

type GameOverScreenProps = {
    // Whether the current user's side won (you can keep setting this from your hooks)
    winnerSide: boolean;

    // Backward-compatible: left/right required for 1v1; top/bottom optional for 4P
    finalScore: Scores4;
    playerNames: Names4;

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
    const is4p = "top" in finalScore || "bottom" in finalScore || "top" in playerNames || "bottom" in playerNames;

    const getName = (s: Side4, fallback: string) => playerNames[s] ?? fallback;
    const getScore = (s: Side4) => finalScore[s] ?? 0;

    return (
        <div className="bg-white p-8 text-center max-w-md mx-auto">
            {/* Trophy/Result Icon */}
            <div className="mb-6">
                <div className={`inline-flex p-6 rounded-full ${winnerSide ? "bg-green-50" : "bg-gray-50"}`}>
                    <Trophy size={48} className={winnerSide ? "text-green-500" : "text-gray-400"} />
                </div>
            </div>

            {/* Result Message */}
            <h2 className={`text-2xl font-bold mb-2 ${winnerSide ? "text-green-600" : "text-gray-600"}`}>
                {winnerSide ? "Victory!" : "Defeat"}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
                {winnerSide ? "Great job! You won the match." : "Better luck next time!"}
            </p>

            {/* Final Score */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Final Score</div>

                {!is4p ? (
                    // 1v1 layout (left vs right) — unchanged
                    <div className="flex items-center justify-center space-x-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{getScore("left")}</div>
                            <div className="text-xs text-gray-500 mt-1">{getName("left", "Player 1")}</div>
                        </div>
                        <div className="text-gray-300 text-xl">:</div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">{getScore("right")}</div>
                            <div className="text-xs text-gray-500 mt-1">{getName("right", "Player 2")}</div>
                        </div>
                    </div>
                ) : (
                    // 4P layout (top, left/right, bottom)
                    <div className="space-y-3">
                        {/* Top */}
                        <div className="flex justify-center">
                            <ScoreItem
                                name={getName("top", "Top")}
                                score={getScore("top")}
                                align="center"
                            />
                        </div>

                        {/* Middle: left / right */}
                        <div className="flex justify-between items-center">
                            <ScoreItem
                                name={getName("left", "Left")}
                                score={getScore("left")}
                                align="left"
                            />
                            <div className="text-gray-300 text-sm px-2">|</div>
                            <ScoreItem
                                name={getName("right", "Right")}
                                score={getScore("right")}
                                align="right"
                            />
                        </div>

                        {/* Bottom */}
                        <div className="flex justify-center">
                            <ScoreItem
                                name={getName("bottom", "Bottom")}
                                score={getScore("bottom")}
                                align="center"
                            />
                        </div>
                    </div>
                )}
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

function ScoreItem({
    name,
    score,
    align = "center",
}: {
    name: string;
    score: number;
    align?: "left" | "center" | "right";
}) {
    const alignClass =
        align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
    return (
        <div className={`flex items-baseline ${alignClass} min-w-[120px]`}>
            <div className="text-2xl font-bold text-gray-900">{score}</div>
            <div className="text-xs text-gray-500 ml-2">{name}</div>
        </div>
    );
}
