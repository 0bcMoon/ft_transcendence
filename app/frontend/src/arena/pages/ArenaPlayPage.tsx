import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";
import type { ArenaState } from "../types/arena.types";

const W = 800;
const H = 600;


function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ArenaPlayPage() {
  const { gameId: gameIdParam } = useParams();
  const gameId = Number(gameIdParam);
  const nav = useNavigate();

  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [myPos, setMyPos] = useState<number | null>(null);
  const [serverState, setServerState] = useState<ArenaState | null>(null);

  // countdown UI
  const [countdown, setCountdown] = useState<number | null>(null); // 3..2..1..0->GO (we'll hide after)
  const countdownStartedRef = useRef(false);

  const wsRef = useRef<WebSocket | null>(null);

  // input state
  const inputRef = useRef({ up: false, down: false, left: false, right: false });

  // rendering refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // smoothing: keep "renderState" separate from latest server state
  const renderPlayersRef = useRef<Map<number, { x: number; y: number; roundsWon: number; position: number }>>(
    new Map()
  );
  const latestServerStateRef = useRef<ArenaState | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const prevStatusRef = useRef<ArenaState["status"] | null>(null);


  const wsUrl = useMemo(() => `${arenaApi.WS_BASE}/arena`, []);

  // allow input only when playing + joined + countdown done
  const canSendInput = () => {
    const s = latestServerStateRef.current;
    if (!s) return false;
    if (!joined) return false;
    if (s.status !== "playing") return false;
    if (countdown !== null) return false;
    return true;
  };

  const sendInput = () => {
    if (!canSendInput()) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        type: "arena:input",
        gameId,
        input: inputRef.current,
      })
    );
  };

  const resetInputs = () => {
    inputRef.current = { up: false, down: false, left: false, right: false };
  };

  const clearCountdown = () => {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };
  
  const startCountdown = () => {
    if (countdownStartedRef.current) return;
  
    countdownStartedRef.current = true;
    resetInputs();
    setCountdown(3);
  
    clearCountdown();
    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          window.setTimeout(() => setCountdown(null), 450);
          clearCountdown();
          return 0; // GO
        }
        return c - 1;
      });
    }, 800);
  };
  

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      //stop scroling in broser with arrors
      if (e.key.startsWith("Arrow")) 
          e.preventDefault();

      // block movement keys while countdown / not playing
      if (!canSendInput()) return;

      let changed = false;
      if ((e.key === "ArrowUp" || e.key === "w") && !inputRef.current.up) { inputRef.current.up = true; changed = true; }
      if ((e.key === "ArrowDown" || e.key === "s") && !inputRef.current.down) { inputRef.current.down = true; changed = true; }
      if ((e.key === "ArrowLeft" || e.key === "a") && !inputRef.current.left) { inputRef.current.left = true; changed = true; }
      if ((e.key === "ArrowRight" || e.key === "d") && !inputRef.current.right) { inputRef.current.right = true; changed = true; }

      if (changed) sendInput();
    };

    const up = (e: KeyboardEvent) => {
      //stop scroling in broser with arrors
      if (e.key.startsWith("Arrow"))
          e.preventDefault();
      
      
      if (!canSendInput()) return;

      let changed = false;
      if ((e.key === "ArrowUp" || e.key === "w") && inputRef.current.up) { inputRef.current.up = false; changed = true; }
      if ((e.key === "ArrowDown" || e.key === "s") && inputRef.current.down) { inputRef.current.down = false; changed = true; }
      if ((e.key === "ArrowLeft" || e.key === "a") && inputRef.current.left) { inputRef.current.left = false; changed = true; }
      if ((e.key === "ArrowRight" || e.key === "d") && inputRef.current.right) { inputRef.current.right = false; changed = true; }

      if (changed) sendInput();
    };

    const onBlur = () => {
      resetInputs();
      sendInput();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", onBlur);
    };
    // countdown + joined are in canSendInput, but we don't want rebind spam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, joined, countdown]);

  // websocket connect + join
  useEffect(() => {
    if (!gameId || Number.isNaN(gameId)) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "arena:join", gameId }));
    };

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      if (msg.type === "arena:joined") {
        setJoined(true);
        setMyPos(msg.playerPosition);
      }

      if (msg.type === "arena:state") {
        setServerState(msg.state);
        latestServerStateRef.current = msg.state;
      }

      if (msg.type === "arena:error") {
        console.error("Arena error:", msg.message);
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    return () => {
      try { ws.close(); } catch {}
    };
  }, [wsUrl, gameId]);

  useEffect(() => {
    countdownStartedRef.current = false;
    prevStatusRef.current = null;
    clearCountdown();
    setCountdown(null);
    resetInputs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);
  

  // init render map when first state arrives
  useEffect(() => {
    if (!serverState) return;
  
    const prev = prevStatusRef.current;
    const next = serverState.status;
    prevStatusRef.current = next;
  
    // only start countdown when we ENTER playing
    if (prev !== "playing" && next === "playing") {
      startCountdown();
    }
  
    // cleanup if match ends
    if (next === "finished" || next === "cancelled") {
      clearCountdown();
      setCountdown(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverState?.status]);
  
  // draw loop (60fps) — keeps your premium style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const s = latestServerStateRef.current;
      if (!s) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      // ---------- Background: soft vignette + subtle glow ----------
      ctx.save();
      ctx.fillStyle = "#050a12";
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(W * 0.5, H * 0.45, 40, W * 0.5, H * 0.5, Math.max(W, H));
      glow.addColorStop(0, "rgba(34, 197, 94, 0.10)");
      glow.addColorStop(0.35, "rgba(56, 189, 248, 0.06)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0.0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.15, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ---------- Arena border: rounded + glow ----------
      const r = 18;
      const x = 10, y = 10, w = W - 20, h = H - 20;

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.20)";
      ctx.shadowColor = "rgba(56, 189, 248, 0.20)";
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(226, 232, 240, 0.18)";
      ctx.stroke();

      ctx.restore();

      // ---------- Smooth players toward server positions ----------
      const map = renderPlayersRef.current;
      for (const sp of s.players) {
        const rp = map.get(sp.userId);
        if (!rp) {
          map.set(sp.userId, { x: sp.x, y: sp.y, roundsWon: sp.roundsWon, position: sp.position });
          continue;
        }
        rp.x = lerp(rp.x, sp.x, 0.25);
        rp.y = lerp(rp.y, sp.y, 0.25);
        rp.roundsWon = sp.roundsWon;
      }

      // ---------- Helpers ----------
      const now = performance.now();
      const pulse = 0.6 + 0.4 * Math.sin(now / 260);

      const playerStyle = (pos: number) => {
        if (pos === 1) return { stroke: "rgba(34,197,94,0.95)", glow: "rgba(34,197,94,0.35)" };
        return { stroke: "rgba(56,189,248,0.95)", glow: "rgba(56,189,248,0.35)" };
      };

      // ---------- Target: glowing orb + ring pulse ----------
      if (s.target) {
        const tx = s.target.x;
        const ty = s.target.y;

        ctx.save();
        ctx.shadowColor = "rgba(250, 204, 21, 0.55)";
        ctx.shadowBlur = 22;

        const g = ctx.createRadialGradient(tx, ty, 2, tx, ty, 22);
        g.addColorStop(0, "rgba(250, 204, 21, 0.95)");
        g.addColorStop(0.55, "rgba(250, 204, 21, 0.22)");
        g.addColorStop(1, "rgba(250, 204, 21, 0.00)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(tx, ty, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(250, 204, 21, 0.95)";
        ctx.beginPath();
        ctx.arc(tx, ty, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.35 + 0.25 * pulse})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 18 + 6 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // ---------- Players: neon ring + inner dot + score tag ----------
      for (const sp of s.players) {
        const rp = map.get(sp.userId);
        if (!rp) continue;

        const isMe = myPos === sp.position;
        const st = playerStyle(sp.position);

        ctx.save();

        ctx.shadowColor = st.glow;
        ctx.shadowBlur = isMe ? 22 : 16;

        ctx.lineWidth = isMe ? 3 : 2.5;
        ctx.strokeStyle = st.stroke;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(226,232,240,0.85)";
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 3.2, 0, Math.PI * 2);
        ctx.fill();

        if (isMe) {
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = st.stroke;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, 34, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        const label = `P${sp.position}  •  ${sp.roundsWon}`;
        ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

        const padX = 10;
        const textW = ctx.measureText(label).width;
        const bx = rp.x + 26;
        const by = rp.y - 22;
        const bw = textW + padX * 2;
        const bh = 22;

        ctx.fillStyle = "rgba(2, 6, 23, 0.70)";
        ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
        ctx.lineWidth = 1;

        const br = 10;
        ctx.beginPath();
        ctx.moveTo(bx + br, by);
        ctx.arcTo(bx + bw, by, bx + bw, by + bh, br);
        ctx.arcTo(bx + bw, by + bh, bx, by + bh, br);
        ctx.arcTo(bx, by + bh, bx, by, br);
        ctx.arcTo(bx, by, bx + bw, by, br);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(226, 232, 240, 0.90)";
        ctx.fillText(label, bx + padX, by + 15);

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [myPos, countdown, joined]);

  // derive HUD numbers
  const p1 = serverState?.players.find((p) => p.position === 1);
  const p2 = serverState?.players.find((p) => p.position === 2);

  // finish/cancel overlay decision (no backend winner field needed)
  const isFinished = serverState?.status === "finished";
  const isCancelled = serverState?.status === "cancelled";

  const myScore = myPos === 1 ? (p1?.roundsWon ?? 0) : myPos === 2 ? (p2?.roundsWon ?? 0) : 0;
  const oppScore = myPos === 1 ? (p2?.roundsWon ?? 0) : myPos === 2 ? (p1?.roundsWon ?? 0) : 0;
  const target = serverState?.targetRoundWins ?? 0;

  const iWon = isFinished && myPos != null && myScore >= target && myScore > oppScore;
  const iLost = isFinished && myPos != null && oppScore >= target && oppScore > myScore;

  const leaveGame = () => {
    try { wsRef.current?.close(); } catch {}
    nav("/arena");
  };

  // HUD
  const hud = serverState ? (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-xs text-slate-400">Player 1</div>
        <div className="text-lg font-semibold">{p1?.roundsWon ?? 0}</div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center">
        <div className="text-xs text-slate-400">Status</div>
        <div className="text-sm font-semibold">{serverState.status}</div>
        <div className="text-xs text-slate-400">First to {serverState.targetRoundWins}</div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-right">
        <div className="text-xs text-slate-400">Player 2</div>
        <div className="text-lg font-semibold">{p2?.roundsWon ?? 0}</div>
      </div>
    </div>
  ) : null;

  // Overlay content
  const showCountdownOverlay = serverState?.status === "playing" && countdown !== null;
  const showWaitingOverlay = serverState?.status === "waiting";
  const showEndOverlay = isFinished || isCancelled;

  const overlayTitle = isCancelled
    ? "Match cancelled"
    : iWon
      ? "Victory"
      : iLost
        ? "Defeat"
        : "Match ended";

  const overlaySubtitle = isCancelled
    ? "A player left the game."
    : isFinished
      ? `Score ${p1?.roundsWon ?? 0} - ${p2?.roundsWon ?? 0}`
      : "";
  useEffect(() => {
    return () => clearCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
      
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          {/* <div>
            <h1 className="text-2xl font-bold">Arena</h1>
            <div className="text-xs text-slate-400">
              WS {connected ? "✅" : "❌"} • Joined {joined ? "✅" : "❌"} • You: {myPos ? `P${myPos}` : "-"} • Game {gameId}
            </div>
          </div> */}

          <div className="flex items-center gap-3">
            {/* <div className="text-sm text-slate-300">
              Move: <span className="font-mono">WASD</span> / <span className="font-mono">Arrows</span>
            </div> */}

            <button
              onClick={leaveGame}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-2"
            >
              Leave
            </button>
          </div>
        </div>

        {hud}

        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full max-w-full rounded-xl border border-slate-800 bg-slate-950"
          />

          {/* Waiting overlay */}
          {showWaitingOverlay && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-6 py-5 text-center shadow">
                <div className="text-xs text-slate-400">Arena</div>
                <div className="text-xl font-bold mt-1">Waiting for opponent…</div>
                <div className="text-sm text-slate-300 mt-2">
                  Once both players join, the match starts automatically.
                </div>
              </div>
            </div>
          )}

          {/* Countdown overlay */}
          {showCountdownOverlay && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-10 py-8 text-center shadow">
                <div className="text-xs text-slate-400">Get ready</div>
                <div className="text-6xl font-black tracking-tight mt-2">
                  {countdown === 0 ? "GO" : countdown}
                </div>
                <div className="text-sm text-slate-300 mt-3">
                  RUUUUUN!
                </div>
              </div>
                
            </div>
          )}

          {/* End overlay */}
          {showEndOverlay && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/75 p-6 text-center shadow">
                <div className="text-3xl font-black">{overlayTitle}</div>
                {overlaySubtitle && (
                  <div className="text-sm text-slate-300 mt-2">{overlaySubtitle}</div>
                )}

                <div className="mt-5">
                  <button
                    className=" w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3 transition"
                    onClick={() => {
                      nav("/arena");
                    }}
                  >
                    Back to Lobby
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Debug (optional) */}
        {/* <details className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <summary className="cursor-pointer text-sm text-slate-300">Debug state</summary>
          <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
            {serverState ? JSON.stringify(serverState, null, 2) : "No state yet..."}
          </pre>
        </details> */}
      </div>
    </div>
  );
}
