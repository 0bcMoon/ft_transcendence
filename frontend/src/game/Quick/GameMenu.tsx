import { Loader2, Users } from "lucide-react";
import React from "react";

type Status =
    | "connecting"
    | "waiting"
    | "matched"
    | "playing"
    | "gameover"
    | "error";

interface GameMenuProps {
    status: Status;
    error: string;
    winner: 1 | 2 | null;
    playerNumber: 1 | 2;
    onPlayAgain: () => void;
    onReturnHome: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
    status,
    error,
    winner,
    playerNumber,
    onPlayAgain,
    onReturnHome,
}) => {
    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-xl mx-auto w-full px-4 py-10">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="bg-green-100 p-4 rounded-full mb-4">
                        <Users size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Quick Match</h2>
                    <p className="text-gray-600 mb-6 text-center">
                        Connects you to another player for a real-time match.
                    </p>
                    {status === "connecting" && (
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                            <Loader2 className="animate-spin" size={20} />
                            Connecting to server…
                        </div>
                    )}
                    {status === "waiting" && (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-green-600 font-semibold animate-pulse">
                                <Loader2 className="animate-spin" size={20} />
                                Waiting for opponent…
                            </div>
                            <div className="text-gray-500 text-xs mt-2">
                                Keep this tab open
                            </div>
                        </div>
                    )}
                    {status === "matched" && (
                        <div className="text-blue-600 font-bold">
                            Match found! Get ready…
                        </div>
                    )}
                    {status === "error" && (
                        <div className="text-red-600 font-semibold">{error}</div>
                    )}
                    {status === "gameover" && (
                        <div className="w-full flex flex-col items-center">
                            <div className="text-xl mt-4 font-bold text-gray-800">
                                {winner === playerNumber ? "You Win!" : "You Lose"}
                            </div>
                            <div className="mt-6 flex gap-4">
                                <button
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
                                    onClick={onPlayAgain}
                                >
                                    Play Again
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400"
                                    onClick={onReturnHome}
                                >
                                    Return Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
