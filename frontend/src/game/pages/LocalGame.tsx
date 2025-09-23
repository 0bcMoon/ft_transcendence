import { useNavigate } from "react-router-dom";
import GameCanvas from "../components/GameCanvas";
import { useLocalGame } from "../hooks/useLocalGame";
import GameHeader from "../components/GameHeader";
import LocalGameOverScreen from "../components/LocalGameOverScreen";
import PlayersHeader from "../components/PlayersHeader";

export default function LocalGame() {
    const navigate = useNavigate();
    const game = useLocalGame();
    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                <GameHeader />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
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

                    {game.isGameOver && game.finalScore && (
                        <LocalGameOverScreen winner={game.winner}
                            finalScore={game.finalScore}
                            playerNames={game.playerNames}
                            handlePlayAgain={game.handlePlayAgain}
                            navigate={navigate} />)}
                </div>

            </div>
        </div>
    );
}

