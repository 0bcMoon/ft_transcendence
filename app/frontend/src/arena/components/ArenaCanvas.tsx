import React, { useEffect, useRef } from "react";
import type { ArenaState, Side } from "../types";
import { ArenaUI } from "../arenaConfig";

export default function ArenaCanvas({
  stateRef,
  waiting,
  countdown,
  isGameOver,
  userSide,
  winner,
}: {
  stateRef: React.MutableRefObject<ArenaState | null>;
  waiting: boolean;
  countdown: number | null;
  isGameOver: boolean;
  userSide: Side | null;
  winner: Side | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, ArenaUI.CANVAS_W, ArenaUI.CANVAS_H);

      // background
      ctx.fillStyle = "#020617"; // slate-950
      ctx.fillRect(0, 0, ArenaUI.CANVAS_W, ArenaUI.CANVAS_H);

      // border
      ctx.strokeStyle = "rgba(148,163,184,0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, ArenaUI.CANVAS_W - 24, ArenaUI.CANVAS_H - 24);

      // waiting screen
      if (waiting) {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 44px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Finding Arena Match...", ArenaUI.CANVAS_W / 2, ArenaUI.CANVAS_H / 2);

        raf = requestAnimationFrame(draw);
        return;
      }

      const s = stateRef.current;
      if (s) {
        // score
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 52px Arial";
        ctx.textAlign = "center";
        ctx.fillText(String(s.score.p1), ArenaUI.CANVAS_W / 2 - 120, 80);
        ctx.fillText(String(s.score.p2), ArenaUI.CANVAS_W / 2 + 120, 80);

        // target
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#22c55e";
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(s.target.x, s.target.y, s.target.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // players squares
        const drawPlayer = (x: number, y: number, size: number, color: string) => {
          ctx.save();
          ctx.shadowBlur = 30;
          ctx.shadowColor = color;
          ctx.fillStyle = color;
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
          ctx.restore();
        };

        drawPlayer(s.p1.x, s.p1.y, s.p1.size, "#3b82f6"); // blue
        drawPlayer(s.p2.x, s.p2.y, s.p2.size, "#ef4444"); // red
      }

      // game over overlay
      if (isGameOver && winner && userSide) {
        const win = winner === userSide;
        ctx.fillStyle = win ? "#10b981" : "#ef4444";
        ctx.font = "bold 72px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(win ? "You Win" : "You Lose", ArenaUI.CANVAS_W / 2, ArenaUI.CANVAS_H / 2);
      }

      // countdown overlay
      if (countdown !== null && countdown > 0) {
        ctx.fillStyle = "rgba(226,232,240,0.95)";
        ctx.font = "bold 90px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(countdown), ArenaUI.CANVAS_W / 2, ArenaUI.CANVAS_H / 2);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [stateRef, waiting, countdown, isGameOver, userSide, winner]);

  return (
    <canvas
      ref={canvasRef}
      width={ArenaUI.CANVAS_W}
      height={ArenaUI.CANVAS_H}
      className="w-full aspect-video"
    />
  );
}
