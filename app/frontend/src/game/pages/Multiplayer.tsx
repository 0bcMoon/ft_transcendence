import GameCanvas from "../components/GameCanvas";
import { useRemoteGame4p } from "../hooks/useRemoteGame4p";
import GameHeader from "../components/GameHeader";
import PlayersHeader from "../components/PlayersHeader4p";
import GameOverScreen from "../components/GameOverScreen";
import WaitingOverlay from "../components/WaitingOverlay";

export default function MultiPlayer() {
    const game = useRemoteGame4p();

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                <GameHeader />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                    {game.waiting && !game.isGameOver && <WaitingOverlay />}

                    {game.playerNames && (
                        <PlayersHeader
                            playerNames={game.playerNames}
                            playerAvatars={game.playerAvatars}
                        />
                    )}

                    {game.playerNames && !game.isGameOver && (
                        <GameCanvas
                            gameStateRef={game.gameStateRef}
                            side={game.side}
                            isGameOver={game.isGameOver}
                            countdown={game.countdown}
                        />
                    )}

                    {/* Show game over screen */}
                    {game.isGameOver && game.finalScore && game.playerNames && (
                        <GameOverScreen
                            winnerSide={game.winner === game.side}
                            finalScore={{
                                left: game.finalScore.left ?? 0,
                                right: game.finalScore.right ?? 0,
                            }}
                            playerNames={{
                                left: game.playerNames.left ?? "Player 1",
                                right: game.playerNames.right ?? "Player 2",
                            }}
                            handlePlayAgain={game.handlePlayAgain}
                            handleGoHome={game.handleGoHome}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
