import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GameCanvas from "../components/GameCanvas";
import { useTournamentGame } from "../hooks/useTournamentGame";
import GameHeader from "../components/GameHeader";
import PlayersHeader from "../components/PlayersHeader";
import WaitingOverlay from "../components/WaitingOverlay";
import { Trophy, Home, ArrowLeft } from "lucide-react";

export default function TournamentPlay() {
    const game = useTournamentGame();
    const navigate = useNavigate();

    // Show error state
    if (game.error) {
        return (
            <div className="col-span-13 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Trophy className="text-red-600" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Game Error</h2>
                        <p className="text-gray-600 mb-6">{game.error}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={game.handleBackToBracket}
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Bracket
                            </button>
                            <button
                                onClick={game.handleGoHome}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-3 rounded-lg transition-colors"
                            >
                                <Home size={18} />
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Game Over state
    if (game.isGameOver && game.finalScore && game.playerNames) {
        const isWinner = game.winner === game.side;
        const winnerName = game.winner === "left"
            ? game.playerNames.left
            : game.playerNames.right;

        return (
            <div className="col-span-13 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        {/* Trophy Icon */}
                        <div className={`${isWinner ? 'bg-yellow-100' : 'bg-gray-100'} p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center`}>
                            <Trophy className={`${isWinner ? 'text-yellow-600' : 'text-gray-600'}`} size={40} />
                        </div>

                        {/* Result Title */}
                        <h2 className={`text-2xl font-bold mb-2 ${isWinner ? 'text-green-600' : 'text-gray-700'}`}>
                            {isWinner ? "You Won! 🎉" : "Game Over"}
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Winner: <span className="font-semibold text-gray-800">{winnerName}</span>
                        </p>

                        {/* Final Score */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex justify-center items-center gap-4">
                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-1">{game.playerNames.left}</div>
                                    <div className="text-3xl font-bold text-gray-800">{game.finalScore.left}</div>
                                </div>
                                <div className="text-2xl text-gray-400 font-bold">-</div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-1">{game.playerNames.right}</div>
                                    <div className="text-3xl font-bold text-gray-800">{game.finalScore.right}</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={game.handleBackToBracket}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                            >
                                <Trophy size={18} />
                                Back to Tournament
                            </button>
                            <button
                                onClick={game.handleGoHome}
                                className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                            >
                                <Home size={18} />
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main game view
    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">

                <GameHeader />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                    {/* Waiting for opponent */}
                    {!game.playerNames && <WaitingOverlay />}

                    {/* Players header (shows during game) */}
                    {!game.isGameOver && game.playerNames && (
                        <PlayersHeader
                            playerNames={game.playerNames}
                            playerAvatars={game.playerAvatars}
                            scores={game.score}
                        />
                    )}

                    {/* Game canvas */}
                    {game.playerNames && !game.isGameOver && (
                        <GameCanvas
                            gameStateRef={game.gameStateRef}
                            side={game.side}
                            isGameOver={game.isGameOver}
                            countdown={game.countdown}
                        />
                    )}
                </div>

                {/* Tournament badge */}
                <div className="text-center mt-4">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        <Trophy size={16} />
                        Tournament Match
                    </div>
                </div>
            </div>
        </div>
    );
}
