import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";

type JoinResult =
  | { status: "idle" }
  | { status: "queued" }
  | { status: "matched"; gameId: number };


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

  const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const hasBody = init?.body != null; // string/Blob/FormData/etc.

    const res = await fetch(`http://localhost:3000${path}`, {
      credentials: "include",
      ...init,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `Request failed: ${res.status}`);
    }

    // status endpoint returns JSON, join/leave return JSON too
    return res.json();
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
          // server says you're not queued anymore
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

  useEffect(() => {
    let alive = true;
  
    (async () => {
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
            } catch {}
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
  }, [navigate]);
  

  useEffect(() => {
    return () => stopPolling();
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
      </div>
    </div>
  );
}
