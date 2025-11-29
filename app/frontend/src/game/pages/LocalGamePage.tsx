import { useNavigate } from "react-router-dom";
import { useLocalGame } from "../hooks/useLocalGame";
import GameCanvas from "../components/GameCanvas";
import GameOver from "../components/GameOver";
import PlayersHeader from "../components/PlayersHeader";
import LocalGameSetupForm from "../components/LocalGameSetupForm";
import { useState } from "react";

export default function LocalGame() {
    const navigate = useNavigate();
    const game = useLocalGame();
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    const handleStart = (p1: string, p2: string) => {
        game.setPlayerNames({ left: p1, right: p2 });
        setIsSetupComplete(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-950">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">

                {!isSetupComplete && (
                    <LocalGameSetupForm onStart={handleStart} />
                )}

                {isSetupComplete && game.isGameOver && game.finalScore && (
                    <GameOver
                        winner={game.winner}
                        finalScore={game.finalScore}
                        playerNames={game.playerNames}
                        handlePlayAgain={game.handlePlayAgain}
                        navigate={navigate}
                        userSide="left"
                    />
                )}

                {isSetupComplete && !game.isGameOver && (
                    <>
                        <PlayersHeader
                            playerNames={game.playerNames}
                            scores={game.gameStateRef.current?.score}
                        />
                        <GameCanvas
                            gameStateRef={game.gameStateRef}
                            isGameOver={game.isGameOver}
                            countdown={game.countdown}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
