import { useRemoteGame } from "../hooks/useRemoteGame";

import GameCanvas from "../components/GameCanvas";
import PlayersHeader from "../components/PlayersHeader";
import GameOver from "../components/GameOver";
import WaitingOverlay from "../components/WaitingOverlay";

export default function RemoteGame() {
    const game = useRemoteGame();

    const getGameState = () => {
        if (!game.playerNames) {
            return "WAITING";
        }
        if (game.isGameOver && game.finalScore) {
            return "GAME_OVER";
        }
        return "PLAYING";
    };

    const gameState = getGameState();
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">

                {gameState === "WAITING" && (
                    <WaitingOverlay />
                )}

                {gameState === "GAME_OVER" && game.playerNames && game.finalScore && (
                    <GameOver
                        winner={game.winner}
                        finalScore={game.finalScore}
                        playerNames={game.playerNames}
                        handlePlayAgain={game.handlePlayAgain}
                        navigate={game.handleGoHome}
                        userSide={game.side ?? 'left'}
                    />
                )}

                {gameState === "PLAYING" && game.playerNames && (
                    <div className="space-y-6">
                        <PlayersHeader
                            playerNames={game.playerNames}
                            playerAvatars={game.playerAvatars} />

                        <div className="relative">
                            <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-xl opacity-80"></div>

                            <div className="relative bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-800 shadow-2xl shadow-black/30 overflow-hidden p-4 sm:p-6">
                                <GameCanvas
                                    gameStateRef={game.gameStateRef}
                                    isGameOver={game.isGameOver}
                                    countdown={game.countdown}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

