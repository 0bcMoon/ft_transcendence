import { GameModeCard } from "../components/GameModeCard";
import { Globe, Trophy, Users, Target, History } from "lucide-react";

export default function GameModesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Game Mode
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
              Pong & Arena are separate games. Pick one and play.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Pong */}
            <GameModeCard
              to="/game/local/play"
              icon={<Users size={24} />}
              title="Pong Local"
              description="Classic 1v1 on the same keyboard."
              colorClass="green"
            />
            <GameModeCard
              to="/game/quick/play"
              icon={<Globe size={24} />}
              title="Pong Remote"
              description="Ranked/casual pong online."
              colorClass="blue"
            />

            {/* Arena */}
            <GameModeCard
              to="/arena/remote/play"
              icon={<Target size={24} />}
              title="Arena Remote"
              description="Race to the target. First to 5 wins."
              colorClass="purple"
            />
            <GameModeCard
              to="/arena/ai/play"
              icon={<Target size={24} />}
              title="Arena AI"
              description="Practice Arena vs server AI."
              colorClass="cyan"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GameModeCard
              to="/arena/history"
              icon={<History size={24} />}
              title="Arena History"
              description="See Arena matches only."
              colorClass="blue"
            />
            <GameModeCard
              to="/history"
              icon={<History size={24} />}
              title="Pong History"
              description="See Pong matches only."
              colorClass="green"
            />
          </div>

          <div className="mt-16 sm:mt-20 text-center">
            <p className="text-slate-500 text-sm">
              Arena is independent from Pong (physics, websocket, DB, history).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
