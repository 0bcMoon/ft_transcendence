import { useNavigate } from "react-router-dom";
import GameCanvas from "../components/GameCanvas";
import GameOverMenu from "../components/GameOverMenu";
import WaitingScreen from "../components/WaitingScreen";
import PlayerInfoBar from "../components/PlayerInfoBar";
import { useRemoteGame } from "../hooks/useRemoteGame";

export default function Game() {
    const navigate = useNavigate();
    const {
        gameStateRef,
        side,
        countdown,
        isGameOver,
        winner,
        waiting,
        playerNames,
        finalScore,
        handlePlayAgain,
        handleGoHome,
    } = useRemoteGame();

    return (
        <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center text-white font-sans">
            <h1 className="text-4xl font-bold mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                PING PONG
            </h1>

            {!isGameOver && playerNames && <PlayerInfoBar playerNames={playerNames} />}

            {!isGameOver && !waiting && side && (
                <GameCanvas
                    gameStateRef={gameStateRef}
                    countdown={countdown}
                    isGameOver={isGameOver}
                    winner={winner}
                    side={side}
                />
            )}

            {isGameOver && finalScore && (
                <GameOverMenu
                    winner={winner}
                    side={side}
                    score={finalScore}
                    onPlayAgain={handlePlayAgain}
                    onExit={() => handleGoHome(navigate)}
                />
            )}

            {waiting && <WaitingScreen />}

        </div>
    );
}


