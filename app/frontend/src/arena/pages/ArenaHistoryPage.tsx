import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";

type ArenaHistoryItem = {
  matchId: number;
  date: string; // ISO-ish string from SQL
  isWin: number | boolean; // SQLite may return 0/1
  user_score: number;
  opponent_score: number;
  opponent_name: string | null;
  opponent_avatar: string | null;
};

type ArenaStats = {
  userId: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // 0..1
  avgUserRoundsWon: number;
  avgOpponentRoundsWon: number;
  vsAI: number;
  vsHuman: number;
};

function fmtDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dt);
}

// If profile_picture is a filename served by your backend static "/public",
// this helps. If yours is already absolute, it keeps it.
// Adjust base if needed.
function resolveAvatar(src: string | null) {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `http://localhost:3000/public/${src.replace(/^\/+/, "")}`;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function ArenaHistoryPage() {
  const nav = useNavigate();

  const [history, setHistory] = useState<ArenaHistoryItem[]>([]);
  const [stats, setStats] = useState<ArenaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const winRatePct = useMemo(() => {
    if (!stats) return 0;
    return Math.round(clamp01(stats.winRate) * 100);
  }, [stats]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [h, s] = await Promise.all([arenaApi.getMyHistory(), arenaApi.getMyStats()]);
        if (!alive) return;

        setHistory(Array.isArray(h) ? h : []);
        setStats(s ?? null);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load arena history");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Arena History</h1>
            <div className="text-xs text-slate-400">
              Your recent Arena matches and performance stats.
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => nav("/arena")}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-2"
            >
              Back to Lobby
            </button>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/25 p-4">
            <div className="font-semibold text-rose-200">Could not load history</div>
            <div className="text-sm text-rose-200/80 mt-1">{err}</div>
          </div>
        )}

        {/* Stats */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Performance</div>
            {stats && (
              <div className="text-xs text-slate-400">
                Games: <span className="text-slate-200 font-semibold">{stats.gamesPlayed}</span>
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-400">Wins</div>
              <div className="text-xl font-black">{stats?.wins ?? (loading ? "…" : 0)}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-400">Losses</div>
              <div className="text-xl font-black">{stats?.losses ?? (loading ? "…" : 0)}</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-400">Win rate</div>
              <div className="text-xl font-black">{loading ? "…" : `${winRatePct}%`}</div>

              {/* simple progress bar */}
              <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500/80"
                  style={{ width: `${loading ? 0 : winRatePct}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs text-slate-400">Opponents</div>
              <div className="text-sm text-slate-200 mt-1">
                <span className="font-semibold">{stats?.vsHuman ?? (loading ? "…" : 0)}</span>{" "}
                Human •{" "}
                <span className="font-semibold">{stats?.vsAI ?? (loading ? "…" : 0)}</span> AI
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Avg rounds: you {stats ? stats.avgUserRoundsWon.toFixed(2) : "…"} • opp{" "}
                {stats ? stats.avgOpponentRoundsWon.toFixed(2) : "…"}
              </div>
            </div>
          </div>
        </div>

        {/* History list */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="text-sm font-semibold text-slate-200">Match History</div>
            <div className="text-xs text-slate-400">
              {loading ? "Loading…" : `${history.length} matches`}
            </div>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 animate-pulse"
                >
                  <div className="h-3 w-40 bg-slate-800 rounded" />
                  <div className="mt-2 h-3 w-64 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-lg font-bold">No matches yet</div>
              <div className="text-sm text-slate-400 mt-1">
                Play a match from the lobby and your history will appear here.
              </div>
              <button
                onClick={() => nav("/arena", { state: { autoQueue: true } })}
                className="mt-4 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-semibold px-5 py-3"
              >
                Find Match
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {history.map((m) => {
                const isWin = !!m.isWin;
                const oppName = m.opponent_name || "Unknown";
                const avatar = resolveAvatar(m.opponent_avatar);

                return (
                  <div
                    key={m.matchId}
                    className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* avatar / fallback */}
                        <div className="relative h-11 w-11 shrink-0 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden flex items-center justify-center">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={oppName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // hide broken images; fallback shows initials below
                                (e.currentTarget as any).style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-slate-300 font-bold">
                              {oppName.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                "px-2 py-1 rounded-lg text-xs font-semibold border " +
                                (isWin
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                  : "bg-rose-500/10 border-rose-500/30 text-rose-200")
                              }
                            >
                              {isWin ? "WIN" : "LOSS"}
                            </span>

                            <div className="text-sm text-slate-200 font-semibold truncate">
                              vs {oppName}
                            </div>
                          </div>

                          <div className="text-xs text-slate-400 mt-1">
                            {fmtDate(m.date)} • Match #{m.matchId}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-slate-400">Score</div>
                        <div className="text-lg font-black tracking-tight">
                          {m.user_score} <span className="text-slate-500">—</span> {m.opponent_score}
                        </div>

                        <button
                          disabled
                          className="mt-2 text-xs px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed"
                          title="Spectator / replay coming soon"
                        >
                          Watch (soon)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
