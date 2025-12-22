import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, XCircle } from "lucide-react";
import { useArenaGameDetail, useArenaGamePlayers } from "../api/arenaQueries";

export default function ArenaMatchDetailsPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const gameId = Number(matchId);

  const { data: detail, isLoading: l1, isError: e1 } = useArenaGameDetail(gameId);
  const { data: players, isLoading: l2, isError: e2 } = useArenaGamePlayers(gameId);

  const isLoading = l1 || l2;
  const isError = e1 || e2;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-white" size={32} />
          <p className="text-slate-400">Loading arena match...</p>
        </div>
      </div>
    );
  }

  if (isError || !detail || !players) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-semibold mb-4">Match not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const p1 = players.find((p) => p.position === 1);
  const p2 = players.find((p) => p.position === 2);

  return (
    <div className="h-full overflow-y-auto bg-slate-950 py-6 md:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-800">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Arena Match #{detail.id}</h1>
          <p className="text-slate-400 mb-6">Mode: {detail.mode.toUpperCase()}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-2">Player 1</p>
              <p className="text-white font-semibold">{p1?.username ?? "P1"}</p>
              <p className="text-slate-300">Score: {p1?.score ?? 0}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-400 text-sm mb-2">Player 2</p>
              <p className="text-white font-semibold">{p2?.is_ai ? "AI" : p2?.username ?? "P2"}</p>
              <p className="text-slate-300">Score: {p2?.score ?? 0}</p>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-400">
            <div>Created: {new Date(detail.created_at).toLocaleString()}</div>
            <div>Status: {detail.status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
