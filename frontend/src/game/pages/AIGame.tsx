import { useNavigate } from "react-router-dom";
import { useAIGame } from "../hooks/useAIGame";
import GameCanvas from "../components/GameCanvas";
import PlayerInfoBar from "../components/PlayerInfoBar";
import GameOverMenu from "../components/GameOverMenu";

export default function AIGame() {
const navigate = useNavigate();
const g = useAIGame();

return (
<div
    className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex flex-col items-center px-4 py-6 sm:px-6 lg:px-12">
    {/* Title */}
    <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
        PING PONG AI
    </h1>

    {g.playerNames && !g.isGameOver && (
    <div className="w-full max-w-4xl mb-4">
        <PlayerInfoBar playerNames={g.playerNames} />
    </div>
    )}

    {!g.isGameOver && (
    <div className="w-full max-w-5xl flex-grow flex items-center justify-center">
        <GameCanvas gameStateRef={g.gameStateRef} countdown={g.countdown} isGameOver={g.isGameOver} winner={g.winner}
            side={g.side} waiting={g.waiting} />
    </div>
    )}

    {g.isGameOver && g.finalScore && (
    <div className="w-full max-w-md mt-6">
        <GameOverMenu winner={g.winner} side={g.side} score={g.finalScore} onPlayAgain={g.handlePlayAgain} onExit={()=>
            g.handleGoHome(navigate)}
            />
    </div>
    )}
</div>
);
}
