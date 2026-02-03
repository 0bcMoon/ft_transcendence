import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";

type GameRow = {
  id: number;
  status: "waiting" | "playing";
  created_at: string;
  started_at: string | null;
  target_round_wins: number;
};

type PlayerBrief = {
  position: number;
  name: string;
  avatar: string | null;
  is_ai: boolean;
};


export default function ArenaMatchesPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [games, setGames] = useState<GameRow[]>([]);
  const [playersByGame, setPlayersByGame] = useState<Record<number, PlayerBrief[]>>({});

  const refreshEveryMs = useMemo(() => 1500, []);

  const load = async () => {
    setErr(null);

    const [playingRes, waitingRes] = await Promise.all([
      arenaApi.getGamesByStatus("playing"),
      arenaApi.getGamesByStatus("waiting"),
    ]);
    
    const live: GameRow[] = [
      ...playingRes.games.map((g) => ({
        id: g.id,
        status: "playing" as const,
        created_at: g.created_at,
        started_at: g.started_at,
        target_round_wins: g.target_round_wins,
      })),
      ...waitingRes.games.map((g) => ({
        id: g.id,
        status: "waiting" as const,
        created_at: g.created_at,
        started_at: g.started_at,
        target_round_wins: g.target_round_wins,
      })),
    ].sort((a, b) => b.id - a.id);

    setGames(live);

    const pairs = await Promise.all(
      live.map(async (g) => {
        try {
          const ps = await arenaApi.getGamePlayers(g.id);
          const brief: PlayerBrief[] = ps.map((p) => ({
            position: p.position,
            name: p.username || (p.is_ai ? "AI" : "Unknown"),
            avatar: p.profile_picture || p.image_src || null,
            is_ai: !!p.is_ai,
          }));
          return [g.id, brief] as const;
        } catch {
          return [g.id, [] as PlayerBrief[]] as const;
        }
      })
    );

    const next: Record<number, PlayerBrief[]> = {};
    for (const [gid, ps] of pairs) next[gid] = ps;
    setPlayersByGame(next);
  };

  useEffect(() => {
    let alive = true;
    let t: number | null = null;

    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load live arena matches");
      } finally {
        if (!alive) return;
        setLoading(false);
      }

      t = window.setInterval(async () => {
        try {
          await load();
        } catch {}
      }, refreshEveryMs);
    })();

    return () => {
      alive = false;
      if (t) window.clearInterval(t);
    };
  }, [refreshEveryMs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Arena Live Matches</h1>
            <div className="text-xs text-slate-400">
              Watching is enabled for <span className="font-semibold">playing</span> games.
            </div>
          </div>

          <button
            onClick={() => nav("/arena")}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-2"
          >
            Back to Lobby
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          {loading && <div className="text-sm text-slate-300">Loading…</div>}

          {!loading && err && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-sm text-rose-200">
              {err}
            </div>
          )}

          {!loading && !err && games.length === 0 && (
            <div className="text-sm text-slate-300">No live arena games right now.</div>
          )}

          {!loading && !err && games.length > 0 && (
            <div className="space-y-3">
              {games.map((g) => {
                const ps = playersByGame[g.id] ?? [];
                const p1 = ps.find((p) => p.position === 1);
                const p2 = ps.find((p) => p.position === 2);

                const canWatch = g.status === "playing";

                return (
                  <div
                    key={g.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-sm font-semibold">Game #{g.id}</div>
                        <span
                          className={
                            "text-xs px-2 py-1 rounded-full border " +
                            (g.status === "playing"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-slate-700 bg-slate-800/40 text-slate-300")
                          }
                        >
                          {g.status === "playing" ? "Playing" : "Waiting"}
                        </span>
                        <div className="text-xs text-slate-400">
                          First to {g.target_round_wins}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                          <div className="flex items-center gap-3">                            
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {p1?.name ?? "Player 1"}
                                {p1?.is_ai ? " (AI)" : ""}
                              </div>
                              <div className="text-xs text-slate-400">P1</div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                          <div className="flex items-center gap-3">                            
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {p2?.name ?? "Player 2"}
                                {p2?.is_ai ? " (AI)" : ""}
                              </div>
                              <div className="text-xs text-slate-400">P2</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => nav(`/game/arena/${g.id}/watch`)}
                      disabled={!canWatch}
                      className={
                        "shrink-0 rounded-xl font-semibold px-4 py-2 transition " +
                        (canWatch
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
                          : "bg-slate-900/40 text-slate-500 border border-slate-800 cursor-not-allowed")
                      }
                      title={canWatch ? "Watch this game" : "Only playing games can be watched"}
                    >
                      Watch
                    </button>
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
