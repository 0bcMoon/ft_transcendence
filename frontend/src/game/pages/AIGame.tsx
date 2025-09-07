import { useNavigate } from "react-router-dom";
import { useAIGame } from "../hooks/useAIGame";
import GameCanvas from "../components/GameCanvas";
import PlayersHeader from "../components/PlayersHeader";
import GameOverScreen from "../components/GameOverScreen";
import WaitingOverlay from "../components/WaitingOverlay";
import GameHeader from "../components/GameHeader";


export default function AIGame() {
    const navigate = useNavigate();
    const game = useAIGame();

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                <GameHeader game={game} />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                    {!game.isGameOver && !game.waiting && (<PlayersHeader game={game} />)}

                    {!game.isGameOver && (<GameCanvas game={game} />)}

                    {game.isGameOver && game.finalScore && (<GameOverScreen game={game} />)}
                </div>
            </div>

            {game.waiting && <WaitingOverlay navigate={navigate} />}
        </div>
    );
}
