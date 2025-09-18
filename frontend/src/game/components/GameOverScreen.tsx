import { Trophy, RotateCcw, Home } from "lucide-react";
import { RemoteGame } from "../types/types";

type GameOverScreenProps = {
    game: RemoteGame;
};

export default function GameOverScreen(props: GameOverScreenProps) {
    const winner = props.game.winner === props.game.side;

    return (
        <div className="bg-white p-8 text-center max-w-md mx-auto">
            {/* Trophy/Result Icon */}
            <div className="mb-6">
                <div className={`inline-flex p-6 rounded-full ${winner ? "bg-green-50" : "bg-gray-50"}`}>
                    <Trophy size={48} className={winner ? "text-green-500" : "text-gray-400"} />
                </div>
            </div>

            {/* Result Message */}
            <h2 className={`text-2xl font-bold mb-2 ${winner ? "text-green-600" : "text-gray-600"}`}>
                {winner ? "Victory!" : "Defeat"}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
                {winner ? "Great job! You won the match." : "Better luck next time!"}
            </p>

            {/* Final Score */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                    Final Score
                </div>
                <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {props.game.finalScore?.left || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {props.game.playerNames?.left || "Player 1"}
                        </div>
                    </div>
                    <div className="text-gray-300 text-xl">:</div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {props.game.finalScore?.right || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {props.game.playerNames?.right || "Player 2"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={props.game.handlePlayAgain}
                    className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <RotateCcw size={18} />
                    <span>Play Again</span>
                </button>
                <button
                    onClick={props.game.handleGoHome}
                    className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                    <Home size={18} />
                    <span>Home</span>
                </button>
            </div>
        </div>
    );
}
