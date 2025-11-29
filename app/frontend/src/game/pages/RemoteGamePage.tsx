import { useRemoteGame } from "../hooks/useRemoteGame";
import GameCanvas from "../components/GameCanvas";
import PlayersHeader from "../components/PlayersHeader";
import GameOver from "../components/GameOver";
import WaitingOverlay from "../components/WaitingOverlay";

export default function RemoteGame() {
    const game = useRemoteGame();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 dark:bg-gray-950">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">

                {!game.playerNames && <WaitingOverlay />}

                {game.playerNames && !game.isGameOver && (
                    <PlayersHeader
                        playerNames={game.playerNames}
                        playerAvatars={game.playerAvatars}
                        scores={game.gameStateRef.current?.score}
                    />
                )}

                {game.playerNames && !game.isGameOver && (
                    <GameCanvas
                        gameStateRef={game.gameStateRef}
                        isGameOver={game.isGameOver}
                        countdown={game.countdown}
                    />
                )}

                {game.isGameOver && game.finalScore && game.playerNames && (
                    <GameOver
                        winner={game.winner}
                        finalScore={game.finalScore}
                        playerNames={game.playerNames}
                        handlePlayAgain={game.handlePlayAgain}
                        navigate={game.handleGoHome}
                        userSide={game.side ?? 'left'}
                    />
                )}
            </div>
        </div>
    );
}
