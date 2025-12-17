import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalGame } from "../hooks/useLocalGame";

import GameCanvas from "../components/GameCanvas";
import GameOver from "../components/GameOver";
import PlayersHeader from "../components/PlayersHeader"; // Your clean header
import LocalGameSetupForm from "../components/LocalGameSetupForm";

export default function LocalGame() {
    const navigate = useNavigate();
    const game = useLocalGame();
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    const handleStart = (p1: string, p2: string) => {
        game.setPlayerNames({ left: p1, right: p2 });
        setIsSetupComplete(true);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">

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
                    <div className="relative">
                        <PlayersHeader playerNames={game.playerNames} />

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
