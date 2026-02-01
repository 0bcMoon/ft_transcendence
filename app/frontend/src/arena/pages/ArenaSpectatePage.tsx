// frontend/src/arena/pages/ArenaSpectatePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { arenaApi } from "../api/arenaApi";
import type { ArenaState } from "../types/arena.types";

const W = 800;
const H = 600;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function ArenaSpectatePage() {
  const { gameId: gameIdParam } = useParams();
  const gameId = Number(gameIdParam);
  const nav = useNavigate();

  const [connected, setConnected] = useState(false);
  const [serverState, setServerState] = useState<ArenaState | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const renderPlayersRef = useRef<
    Map<number, { x: number; y: number; roundsWon: number; position: number }>
  >(new Map());
  const latestServerStateRef = useRef<ArenaState | null>(null);

  const wsUrl = useMemo(() => `${arenaApi.WS_BASE}/arena`, []);

  useEffect(() => {
    if (!gameId || Number.isNaN(gameId)) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "arena:join", gameId, spectate: true }));
    };

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

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
      try {
        ws.close();
      } catch {}
    };
  }, [wsUrl, gameId]);

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

      // background
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

      // border
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

      // smoothing
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

      const now = performance.now();
      const pulse = 0.6 + 0.4 * Math.sin(now / 260);

      const playerStyle = (pos: number) => {
        if (pos === 1) return { stroke: "rgba(34,197,94,0.95)", glow: "rgba(34,197,94,0.35)" };
        return { stroke: "rgba(56,189,248,0.95)", glow: "rgba(56,189,248,0.35)" };
      };

      // target
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

      // players
      for (const sp of s.players) {
        const rp = map.get(sp.userId);
        if (!rp) continue;

        const st = playerStyle(sp.position);

        ctx.save();
        ctx.shadowColor = st.glow;
        ctx.shadowBlur = 16;

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = st.stroke;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(226,232,240,0.85)";
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 3.2, 0, Math.PI * 2);
        ctx.fill();

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
  }, []);

  const p1 = serverState?.players.find((p) => p.position === 1);
  const p2 = serverState?.players.find((p) => p.position === 2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Arena</h1>
            <div className="text-xs text-slate-400">
              Spectating • WS {connected ? "✅" : "❌"} • Game {gameId}
            </div>
          </div>

          <button
            onClick={() => {
              try {
                wsRef.current?.close();
              } catch {}
              nav("/arena");
            }}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-2"
          >
            Back
          </button>
        </div>

        {serverState && (
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
        )}

        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full max-w-full rounded-xl border border-slate-800 bg-slate-950"
          />

          {!serverState && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-6 py-5 text-center shadow">
                <div className="text-xs text-slate-400">Arena</div>
                <div className="text-xl font-bold mt-1">Loading…</div>
                <div className="text-sm text-slate-300 mt-2">Waiting for state sync.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
