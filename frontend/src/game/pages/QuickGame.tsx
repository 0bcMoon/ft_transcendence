import { useNavigate } from "react-router-dom";
import GameCanvas from "../components/GameCanvas";
import GameOverMenu from "../components/GameOverMenu";
import WaitingScreen from "../components/WaitingScreen";
import PlayerInfoBar from "../components/PlayerInfoBar";
import { useRemoteGame } from "../hooks/useRemoteGame";

export default function Game() {
    const navigate = useNavigate();
    const game = useRemoteGame();
    return (
        <div
            className="h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center text-white font-sans">
            <h1
                className="text-4xl font-bold mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                PING PONG
            </h1>

            {game.playerNames && !game.isGameOver && !game.waiting && (
                <PlayerInfoBar playerNames={game.playerNames} />
            )}

            {!game.isGameOver && (
                <GameCanvas gameStateRef={game.gameStateRef} countdown={game.countdown} isGameOver={game.isGameOver}
                    winner={game.winner} side={game.side} waiting={game.waiting} />
            )}

            {game.isGameOver && game.finalScore && (
                <GameOverMenu winner={game.winner} side={game.side} score={game.finalScore} onPlayAgain={game.handlePlayAgain}
                    onExit={() => game.handleGoHome(navigate)}
                />
            )}

            {game.waiting &&
                <WaitingScreen />}
        </div>
    );
}
