import { useRemoteGame } from "../hooks/useRemoteGame"

import GameCanvas from "../components/GameCanvas"
import PlayersHeader from "../components/PlayersHeader"
import GameInstructions from "../components/GameInstructions"

export default function RemoteGame() {
    const game = useRemoteGame()
    console.log("RemoteGame - playerAvatars:", game.playerAvatars)

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <div className="space-y-6">
                    {game.playerNames && <PlayersHeader playerNames={game.playerNames} playerAvatars={game.playerAvatars} />}

                    <div className="relative">
                        <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-xl opacity-80"></div>
                        <div className="relative bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-800 shadow-2xl shadow-black/30 overflow-hidden p-4 sm:p-6">
                            <GameCanvas
                                gameStateRef={game.gameStateRef}
                                isGameOver={game.isGameOver}
                                countdown={game.countdown}
                                waiting={game.waiting}
                                userSide={game.side ?? "left"}
                                winner={game.winner}
                            />
                        </div>
                    </div>

                    <GameInstructions
                        userSide={game.side ?? "left"}
                        mode="remote"
                    />
                </div>
            </div>
        </div>
    )
}

