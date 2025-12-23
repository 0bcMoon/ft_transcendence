import { useState } from "react";
import { useLocalGame } from "../hooks/useLocalGame";

import GameCanvas from "../components/GameCanvas";
import PlayersHeader from "../components/PlayersHeader";
import LocalGameSetupForm from "../components/LocalGameSetupForm";
import GameInstructions from "../components/GameInstructions";

export default function LocalGame() {
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


                {isSetupComplete && (
                    <div className="relative">
                        <PlayersHeader
                            playerNames={game.playerNames}
                            playerAvatars={null}
                        />

                        <div className="relative">
                            <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-xl opacity-80"></div>
                            <div className="relative bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-800 shadow-2xl shadow-black/30 overflow-hidden p-4 sm:p-6">

                                <GameCanvas
                                    gameStateRef={game.gameStateRef}
                                    isGameOver={game.isGameOver}
                                    countdown={game.countdown}
                                    userSide={"left"}
                                    winner={game.winner}
                                />
                            </div>
                        </div>
                        <GameInstructions
                            userSide={"right"}
                            mode="local"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
