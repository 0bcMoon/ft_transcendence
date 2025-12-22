import { useArenaGame } from "../hooks/useArenaGame";
import ArenaCanvas from "../components/ArenaCanvas";
import ArenaPlayersHeader from "../components/ArenaPlayersHeader";
import ArenaInstructions from "../components/ArenaInstructions";

export default function ArenaRemotePage() {
  const game = useArenaGame("remote");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {game.playerNames && (
          <ArenaPlayersHeader playerNames={game.playerNames} playerAvatars={game.playerAvatars} />
        )}

        <div className="relative">
          <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-xl opacity-80"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-800 shadow-2xl shadow-black/30 overflow-hidden p-4 sm:p-6">
            <ArenaCanvas
              stateRef={game.stateRef}
              waiting={game.waiting}
              countdown={game.countdown}
              isGameOver={game.isGameOver}
              userSide={game.side}
              winner={game.winner}
            />
          </div>
        </div>

        <ArenaInstructions mode="remote" />
      </div>
    </div>
  );
}
