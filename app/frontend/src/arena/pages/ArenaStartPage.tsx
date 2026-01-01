import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";

export default function ArenaStartPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const createAndPlay = async () => {
    setLoading(true);
    setErr(null);
    try {
      // ✅ TEMP TEST: hardcoded 1 vs 2 (you already used this)
      const data = await arenaApi.createGame({
        players: [
          { user_id: 1, position: 1 },
          { user_id: 2, position: 2 },
        ],
        target_round_wins: 5,
      });

      const gameId = data?.game?.id;
      if (!gameId) throw new Error("Server did not return game.id");

      nav(`/game/arena/${gameId}/play`);
    } catch (e: any) {
      setErr(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Arena - Start</h1>

        {err && (
          <div className="rounded border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {err}
          </div>
        )}

        <button
          onClick={createAndPlay}
          disabled={loading}
          className="w-full rounded bg-blue-600 px-3 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Arena Game (1 vs 2) & Play"}
        </button>

        <div className="text-xs text-slate-400">
          Step test: this must create a game (201) then navigate to play page.
        </div>
      </div>
    </div>
  );
}
