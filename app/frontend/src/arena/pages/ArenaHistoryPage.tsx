import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, History, Gamepad2 } from "lucide-react";
import { useAuthStore } from "@/state/authStore";
import { useArenaRecentGlobal } from "../api/arenaQueries";
import type { ArenaGlobalMatch } from "../types";

export default function ArenaHistoryPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: matches = [], isLoading } = useArenaRecentGlobal(30);

  const getWinner = (m: ArenaGlobalMatch) => {
    if (m.player1_score > m.player2_score) return "p1";
    if (m.player2_score > m.player1_score) return "p2";
    return "draw";
  };

  const getAvatar = (avatar: string | null, name: string) =>
    avatar
      ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=64`;

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-slate-950 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-lime-600 flex items-center justify-center shadow-lg">
              <History className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Arena History</h1>
              <p className="text-base text-slate-400 mt-1">
                {matches.length} {matches.length === 1 ? "match" : "matches"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden p-0">
          {isLoading && (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-6 px-8 rounded-xl bg-slate-800/60 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-700 rounded" />
                    <div className="h-3 w-20 bg-slate-800 rounded" />
                  </div>
                  <div className="w-16 h-6 bg-slate-700 rounded" />
                  <div className="w-16 h-16 rounded-full bg-slate-700" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && matches.length > 0 && (
            <ul className="divide-y divide-slate-800">
              {matches.map((m) => {
                const winner = getWinner(m);
                const p1Win = winner === "p1";
                const p2Win = winner === "p2";

                const isPlayer1 = m.player1_name === user?.username;
                const userName = isPlayer1 ? m.player1_name : m.player2_name;
                const userAvatar = isPlayer1 ? m.player1_avatar : m.player2_avatar;
                const opponentName = isPlayer1 ? m.player2_name : m.player1_name;
                const opponentAvatar = isPlayer1 ? m.player2_avatar : m.player1_avatar;
                const userScore = isPlayer1 ? m.player1_score : m.player2_score;
                const opponentScore = isPlayer1 ? m.player2_score : m.player1_score;
                const isWin = isPlayer1 ? p1Win : p2Win;

                return (
                  <li key={m.matchId}>
                    <Link
                      to={`/arena/history/${m.matchId}`}
                      className="flex items-center gap-4 py-6 px-8 bg-transparent hover:bg-emerald-900/25 transition rounded-xl block"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={getAvatar(userAvatar, userName)}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                        />
                        <div>
                          <p className={`text-base font-semibold ${isWin ? "text-emerald-200" : "text-slate-400"}`}>
                            {userName}
                          </p>
                          <p className="text-sm text-slate-400">
                            Arena &bull; {m.date} &bull; {m.mode.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="font-extrabold text-2xl mx-3 flex-shrink-0">
                        <span className={isWin ? "text-emerald-300" : "text-slate-400"}>{userScore}</span>
                        <span className="mx-2 text-slate-500">-</span>
                        <span className={!isWin ? "text-emerald-300" : "text-slate-400"}>{opponentScore}</span>
                      </div>

                      <div className="flex items-center gap-4 flex-1 justify-end">
                        <div className="text-right">
                          <p className={`text-base font-semibold ${!isWin ? "text-emerald-200" : "text-slate-400"}`}>
                            {opponentName}
                          </p>
                          <p className="text-sm text-slate-400">Opponent</p>
                        </div>
                        <img
                          src={getAvatar(opponentAvatar, opponentName)}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!isLoading && matches.length === 0 && (
            <div className="py-10 text-center">
              <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-slate-400 text-base mb-2">No Arena Matches Yet</p>
              <p className="text-sm text-slate-500 mb-4">Play Arena to see match history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
