import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";
import type { ArenaState, ArenaPlayerState } from "../types/arena.types";

const W = 800;
const H = 600;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ArenaPlayPage() {
  const { gameId: gameIdParam } = useParams();
  const gameId = Number(gameIdParam);

  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [myPos, setMyPos] = useState<number | null>(null);
  const [serverState, setServerState] = useState<ArenaState | null>(null);

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

  const wsUrl = useMemo(() => `${arenaApi.WS_BASE}/arena`, []);

  const sendInput = () => {
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

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      let changed = false;
      if ((e.key === "ArrowUp" || e.key === "w") && !inputRef.current.up) { inputRef.current.up = true; changed = true; }
      if ((e.key === "ArrowDown" || e.key === "s") && !inputRef.current.down) { inputRef.current.down = true; changed = true; }
      if ((e.key === "ArrowLeft" || e.key === "a") && !inputRef.current.left) { inputRef.current.left = true; changed = true; }
      if ((e.key === "ArrowRight" || e.key === "d") && !inputRef.current.right) { inputRef.current.right = true; changed = true; }
      if (changed) sendInput();
    };
    const up = (e: KeyboardEvent) => {
      let changed = false;
      if ((e.key === "ArrowUp" || e.key === "w") && inputRef.current.up) { inputRef.current.up = false; changed = true; }
      if ((e.key === "ArrowDown" || e.key === "s") && inputRef.current.down) { inputRef.current.down = false; changed = true; }
      if ((e.key === "ArrowLeft" || e.key === "a") && inputRef.current.left) { inputRef.current.left = false; changed = true; }
      if ((e.key === "ArrowRight" || e.key === "d") && inputRef.current.right) { inputRef.current.right = false; changed = true; }
      if (changed) sendInput();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [gameId]);

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

    return () => ws.close();
  }, [wsUrl, gameId]);

  // init render map when first state arrives
  useEffect(() => {
    if (!serverState) return;
    const map = renderPlayersRef.current;

    for (const p of serverState.players) {
      if (!map.has(p.userId)) {
        map.set(p.userId, { x: p.x, y: p.y, roundsWon: p.roundsWon, position: p.position });
      } else {
        // update rounds immediately
        const r = map.get(p.userId)!;
        r.roundsWon = p.roundsWon;
        r.position = p.position;
      }
    }
  }, [serverState]);

  // draw loop (60fps)
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
        // base
        ctx.save();
        ctx.fillStyle = "#050a12"; // deep navy/black (premium)
        ctx.fillRect(0, 0, W, H);
      
        // center glow
        const glow = ctx.createRadialGradient(W * 0.5, H * 0.45, 40, W * 0.5, H * 0.5, Math.max(W, H));
        glow.addColorStop(0, "rgba(34, 197, 94, 0.10)");  // green-ish glow
        glow.addColorStop(0.35, "rgba(56, 189, 248, 0.06)"); // cyan-ish glow
        glow.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
      
        // vignette (dark edges)
        const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.15, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
      
        // ---------- Arena border: rounded + glow ----------
        const r = 18;
        const x = 10, y = 10, w = W - 20, h = H - 20;
      
        // glow stroke
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
      
        // inner faint stroke (crisp)
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
        const pulse = 0.6 + 0.4 * Math.sin(now / 260); // 0.2..1.0-ish
      
        const playerStyle = (pos: number) => {
          // two distinct neon accents
          if (pos === 1) return { stroke: "rgba(34,197,94,0.95)", glow: "rgba(34,197,94,0.35)" };  // green
          return { stroke: "rgba(56,189,248,0.95)", glow: "rgba(56,189,248,0.35)" };               // cyan
        };
      
        // ---------- Target: glowing orb + ring pulse ----------
        if (s.target) {
          const tx = s.target.x;
          const ty = s.target.y;
      
          // glow blob behind
          ctx.save();
          ctx.globalAlpha = 1;
          ctx.shadowColor = "rgba(250, 204, 21, 0.55)"; // warm gold
          ctx.shadowBlur = 22;
      
          const g = ctx.createRadialGradient(tx, ty, 2, tx, ty, 22);
          g.addColorStop(0, "rgba(250, 204, 21, 0.95)");
          g.addColorStop(0.55, "rgba(250, 204, 21, 0.22)");
          g.addColorStop(1, "rgba(250, 204, 21, 0.00)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(tx, ty, 22, 0, Math.PI * 2);
          ctx.fill();
      
          // core
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(250, 204, 21, 0.95)";
          ctx.beginPath();
          ctx.arc(tx, ty, 10, 0, Math.PI * 2);
          ctx.fill();
      
          // pulse ring
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
      
          // outer glow
          ctx.shadowColor = st.glow;
          ctx.shadowBlur = isMe ? 22 : 16;
      
          // ring
          ctx.lineWidth = isMe ? 3 : 2.5;
          ctx.strokeStyle = st.stroke;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, 18, 0, Math.PI * 2);
          ctx.stroke();
      
          // inner dot (gives “body” without filling the circle)
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(226,232,240,0.85)";
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, 3.2, 0, Math.PI * 2);
          ctx.fill();
      
          // “me” halo
          if (isMe) {
            ctx.globalAlpha = 0.18;
            ctx.fillStyle = st.stroke;
            ctx.beginPath();
            ctx.arc(rp.x, rp.y, 34, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
      
          // label badge (clean)
          const label = `P${sp.position}  •  ${sp.roundsWon}`;
          ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      
          const padX = 10;
          const padY = 6;
          const textW = ctx.measureText(label).width;
          const bx = rp.x + 26;
          const by = rp.y - 22;
          const bw = textW + padX * 2;
          const bh = 22;
      
          // badge bg
          ctx.fillStyle = "rgba(2, 6, 23, 0.70)";
          ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
          ctx.lineWidth = 1;
      
          // rounded rect badge
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
      
          // badge text
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
  }, [myPos]);

  // HUD
  const hud = (() => {
    if (!serverState) return null;

    const p1 = serverState.players.find((p) => p.position === 1);
    const p2 = serverState.players.find((p) => p.position === 2);

    return (
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
    );
  })();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Arena</h1>
            <div className="text-xs text-slate-400">
              WS {connected ? "✅" : "❌"} • Joined {joined ? "✅" : "❌"} • You: {myPos ? `P${myPos}` : "-"} • Game {gameId}
            </div>
          </div>

          <div className="text-sm text-slate-300">
            Move: <span className="font-mono">WASD</span> / <span className="font-mono">Arrows</span>
          </div>
        </div>

        {hud}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full max-w-full rounded-xl border border-slate-800 bg-slate-950"
          />
        </div>

        {/* Debug (optional) */}
        <details className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <summary className="cursor-pointer text-sm text-slate-300">Debug state</summary>
          <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
            {serverState ? JSON.stringify(serverState, null, 2) : "No state yet..."}
          </pre>
        </details>
      </div>
    </div>
  );
}
