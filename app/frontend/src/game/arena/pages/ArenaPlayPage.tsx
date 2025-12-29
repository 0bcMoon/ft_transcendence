import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

type ArenaStatus = "waiting" | "playing" | "finished" | "cancelled";

type ArenaPlayerState = {
  userId: number;
  position: 1 | 2;
  x: number;
  y: number;
  roundsWon: number;
};

type ArenaState = {
  gameId: number;
  status: ArenaStatus;
  players: ArenaPlayerState[];
  target: { x: number; y: number } | null;
  targetRoundWins: number;
};

type ArenaWsMessage =
  | { type: "arena:joined"; playerPosition: 1 | 2 }
  | { type: "arena:state"; state: ArenaState }
  | { type: "arena:error"; message: string };

const W = 800;
const H = 600;
const SPEED = 6;

export default function ArenaPlayPage() {
  const { gameId } = useParams();
  const id = Number(gameId);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [state, setState] = useState<ArenaState | null>(null);
  const [myPosition, setMyPosition] = useState<1 | 2 | null>(null);

  const myXYRef = useRef<{ x: number; y: number }>({ x: 100, y: 300 });

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;

    const ws = new WebSocket("ws://localhost:3000/ws/arena");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "arena:join", gameId: id }));
    };

    ws.onmessage = (evt) => {
      const msg: ArenaWsMessage = JSON.parse(evt.data);

      if (msg.type === "arena:error") {
        console.error("Arena WS error:", msg.message);
        return;
      }

      if (msg.type === "arena:joined") {
        setMyPosition(msg.playerPosition);
        return;
      }

      if (msg.type === "arena:state") {
        setState(msg.state);

        // request first target if server sends none
        if (!msg.state.target) {
          ws.send(JSON.stringify({ type: "arena:request_target", gameId: id }));
        }

        // keep our local position synced from server
        if (myPosition) {
          const me = msg.state.players.find((p) => p.position === myPosition);
          if (me) myXYRef.current = { x: me.x, y: me.y };
        }
      }
    };

    ws.onerror = (e) => console.error("WS error", e);
    ws.onclose = () => console.log("WS closed");

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (!myPosition) return;

      const cur = myXYRef.current;
      let x = cur.x;
      let y = cur.y;

      const key = e.key.toLowerCase();
      if (key === "arrowup" || key === "w") y -= SPEED;
      if (key === "arrowdown" || key === "s") y += SPEED;
      if (key === "arrowleft" || key === "a") x -= SPEED;
      if (key === "arrowright" || key === "d") x += SPEED;

      x = Math.max(0, Math.min(W, x));
      y = Math.max(0, Math.min(H, y));

      if (x === cur.x && y === cur.y) return;

      myXYRef.current = { x, y };

      ws.send(JSON.stringify({ type: "arena:move", gameId: id, x, y }));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, myPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // bg
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);

      // border
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.strokeRect(0, 0, W, H);

      if (!state) {
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "14px sans-serif";
        ctx.fillText("Connecting to arena...", 12, 22);
        raf = requestAnimationFrame(draw);
        return;
      }

      // top info
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "14px sans-serif";
      ctx.fillText(
        `Arena #${state.gameId} | ${state.status} | First to ${state.targetRoundWins} rounds`,
        12,
        22
      );

      // target
      if (state.target) {
        ctx.beginPath();
        ctx.fillStyle = "#fbbf24";
        ctx.arc(state.target.x, state.target.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // players
      for (const p of state.players) {
        ctx.beginPath();
        ctx.fillStyle = p.position === 1 ? "#60a5fa" : "#f87171";
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.fillText(`P${p.position} (${p.roundsWon})`, p.x - 18, p.y - 18);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  if (!id || Number.isNaN(id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        Invalid gameId
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-3 text-slate-200 text-sm">
          <div>Controls: WASD / Arrows</div>
          <div>My side: {myPosition ?? "..."}</div>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-xl border border-slate-800 bg-slate-900 shadow-2xl"
        />
      </div>
    </div>
  );
}
