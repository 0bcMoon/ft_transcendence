import GameCanvas from "../components/GameCanvas";
import { useTournamentGame } from "../hooks/useTournamentGame";
import PlayersHeader from "../components/PlayersHeader";
import GameOver from "../components/GameOver";
import WaitingOverlay from "../components/WaitingOverlay";
import DisplayTournament from "../components/TournamentBracket";

export default function RemoteGame() {
    const game = useTournamentGame();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh)] p-4 sm:p-6 dark:bg-gray-950">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">

                {!game.playerNames && <WaitingOverlay />}
                {!game.isGameOver && game.playerNames && (
                    <PlayersHeader
                        playerNames={game.playerNames}
                        playerAvatars={game.playerAvatars}
                        scores={game.gameStateRef.current?.score}
                    />
                )}

                {game.playerNames && !game.isGameOver && (
                    <GameCanvas
                        gameStateRef={game.gameStateRef}
                        isGameOver={game.isGameOver}
                        countdown={game.countdown}
                    />
                )}

                {game.isGameOver && game.finalScore && game.playerNames && (
                    <DisplayTournament />
                )}
            </div>
        </div>
    );
}

