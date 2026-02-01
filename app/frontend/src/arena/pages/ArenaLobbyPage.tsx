// frontend/src/arena/pages/ArenaLobbyPage.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";

export default function ArenaLobbyPage() {
  const [state, setState] = useState<"idle" | "queued" | "matched">("idle");
  const [gameId, setGameId] = useState<number | null>(null);
  const navigate = useNavigate();

  const pollRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const joinQueue = async () => {
    stopPolling();

    const r = await arenaApi.joinMatchmaking();

    if (r.status === "matched") {
      setState("matched");
      setGameId(r.gameId);
      navigate(`/game/arena/${r.gameId}/play`);
      return;
    }

    setState("queued");

    pollRef.current = window.setInterval(async () => {
      try {
        const s = await arenaApi.getMatchmakingStatus();

        if (s.status === "matched") {
          stopPolling();
          setState("matched");
          setGameId(s.gameId);
          navigate(`/game/arena/${s.gameId}/play`);
        } else if (s.status === "idle") {
          stopPolling();
          setState("idle");
          setGameId(null);
        }
      } catch {
        // ignore transient polling errors
      }
    }, 800);
  };

  const leaveQueue = async () => {
    stopPolling();
    try {
      await arenaApi.leaveMatchmaking();
    } finally {
      setState("idle");
      setGameId(null);
    }
  };

  const location = useLocation();
  const autoQueue = !!(location.state as any)?.autoQueue;

  // Restore matchmaking status on mount, but avoid racing when autoQueue is requested.
  useEffect(() => {
    let alive = true;

    (async () => {
      if (autoQueue) return;

      try {
        const s = await arenaApi.getMatchmakingStatus();
        if (!alive) return;

        if (s.status === "matched") {
          setState("matched");
          setGameId(s.gameId);
          navigate(`/game/arena/${s.gameId}/play`);
          return;
        }

        if (s.status === "queued") {
          setState("queued");

          pollRef.current = window.setInterval(async () => {
            try {
              const st = await arenaApi.getMatchmakingStatus();

              if (st.status === "matched") {
                stopPolling();
                setState("matched");
                setGameId(st.gameId);
                navigate(`/game/arena/${st.gameId}/play`);
              } else if (st.status === "idle") {
                stopPolling();
                setState("idle");
                setGameId(null);
              }
            } catch {
              // ignore transient polling errors
            }
          }, 800);

          return;
        }

        // idle
        setState("idle");
        setGameId(null);
      } catch {
        // if status fails, keep idle
        setState("idle");
        setGameId(null);
      }
    })();

    return () => {
      alive = false;
      stopPolling();
    };
  }, [navigate, autoQueue]);

  // Auto start matchmaking when coming back with state.autoQueue
  useEffect(() => {
    if (autoQueue) {
      joinQueue().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Arena Lobby</h1>
        <p className="text-sm text-slate-300 mb-6">
          Queue up for a 1v1. First queued becomes P1, second becomes P2.
        </p>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 mb-5">
          <div className="text-sm text-slate-300">Status:</div>
          <div className="mt-1 font-semibold">
            {state === "idle" && "Idle"}
            {state === "queued" && "Searching…"}
            {state === "matched" && `Matched! Game #${gameId}`}
          </div>
        </div>

        {/* Matchmaking */}
        {state !== "queued" ? (
          <button
            onClick={joinQueue}
            className="w-full rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-semibold py-3"
          >
            Find Match
          </button>
        ) : (
          <button
            onClick={leaveQueue}
            className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3"
          >
            Cancel Search
          </button>
        )}

        {/* History */}
        <button
          onClick={() => navigate("/arena/history")}
          className="w-full mt-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3"
        >
          View History
        </button>

        {/* Play vs AI */}
        <button
          onClick={async () => {
            if (state === "queued") return;
            const r = await arenaApi.createAIGame();
            navigate(`/game/arena/${r.gameId}/play`);
          }}
          disabled={state === "queued"}
          className={
            "w-full mt-3 rounded-xl font-semibold py-3 transition " +
            (state === "queued"
              ? "bg-slate-900/40 text-slate-500 border border-slate-800 cursor-not-allowed"
              : "bg-slate-800 hover:bg-slate-700 text-slate-100")
          }
        >
          Play vs AI
        </button>
        <button
          onClick={() => navigate("/arena/matches")}
          className="w-full mt-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3"
        >
          Watch Live Matches
        </button>
        
      </div>
    </div>
  );
}
