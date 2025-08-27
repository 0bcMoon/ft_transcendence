import { useLocation, useNavigate } from "react-router-dom";
import GameCanvas from "../components/GameCanvas";
import LocalGameOverMenu from "../components/LocalGameOverMenu";
import { useLocalGame } from "../hooks/useLocalGame";

export default function LocalGame() {
    const location = useLocation();
    const navigate = useNavigate();
    const { player1, player2 } = location.state || {};

    const {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        handlePlayAgain,
    } = useLocalGame();

    return (
        <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center text-white font-sans">
            <h1 className="text-4xl font-bold mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                PING PONG
            </h1>

            {!isGameOver && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full flex justify-between px-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {player1.charAt(0).toUpperCase()}
                            </div>
                            {/* <div className="text-green-400 font-semibold text-sm">{player1}</div> */}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* <div className="text-blue-400 font-semibold text-sm">{player2}</div> */}
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {player2.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <GameCanvas
                        gameStateRef={gameStateRef}
                        countdown={countdown}
                        isGameOver={isGameOver}
                        winner={winner}
                        side={null}
                        playerNames={{ left: player1, right: player2 }}
                    />
                </div>
            )}


            {isGameOver && (
                <LocalGameOverMenu
                    winner={winner}
                    score={gameStateRef.current?.score}
                    playerNames={{ left: player1, right: player2 }}
                    onPlayAgain={handlePlayAgain}
                    onExit={() => navigate("/")}
                />
            )}
        </div>
    );
}

