import GameCanvas from "../components/GameCanvas";
import { useRemoteGame } from "../hooks/useRemoteGame";
import GameHeader from "../components/GameHeader";
import PlayersHeader from "../components/PlayersHeader";
import GameOverScreen from "../components/GameOverScreen";
import WaitingOverlay from "../components/WaitingOverlay";

export default function Game() {
    const game = useRemoteGame();

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">
                <GameHeader game={game} />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                    {!game.isGameOver && !game.waiting && (<PlayersHeader game={game} />)}

                    {!game.isGameOver && (<GameCanvas game={game} />)}

                    {game.isGameOver && game.finalScore && (<GameOverScreen game={game} />)}

                    {game.waiting && <WaitingOverlay />}
                </div>
            </div>
        </div>
    );
}

