import { ArenaConfig } from "./arena.config";
import type { ArenaState, Side } from "./arena.types";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function initArenaState(): ArenaState {
  const { W, H } = ArenaConfig.CANVAS;
  const size = ArenaConfig.PLAYER.SIZE;

  const state: ArenaState = {
    tick: 0,
    target: { x: W / 2, y: H / 2, r: ArenaConfig.TARGET.R },
    p1: { x: W * 0.25, y: H / 2, size },
    p2: { x: W * 0.75, y: H / 2, size },
    score: { p1: 0, p2: 0 },
  };

  respawnTarget(state);
  return state;
}

export function respawnTarget(state: ArenaState) {
  const { W, H } = ArenaConfig.CANVAS;
  const pad = 60;

  state.target.x = rand(pad, W - pad);
  state.target.y = rand(pad, H - pad);
}

export function applyMove(
  state: ArenaState,
  side: Side,
  keys: { up: boolean; down: boolean; left: boolean; right: boolean }
) {
  const p = side === "p1" ? state.p1 : state.p2;
  const s = ArenaConfig.PLAYER.SPEED;

  let dx = 0;
  let dy = 0;
  if (keys.up) dy -= s;
  if (keys.down) dy += s;
  if (keys.left) dx -= s;
  if (keys.right) dx += s;

  p.x += dx;
  p.y += dy;

  const half = p.size / 2;
  p.x = clamp(p.x, half, ArenaConfig.CANVAS.W - half);
  p.y = clamp(p.y, half, ArenaConfig.CANVAS.H - half);
}

export function distanceToTarget(state: ArenaState, side: Side) {
  const p = side === "p1" ? state.p1 : state.p2;
  const dx = p.x - state.target.x;
  const dy = p.y - state.target.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function checkScore(state: ArenaState): Side | null {
  // square touches circle: use circle-to-center with "hit radius"
  const hit = state.target.r + state.p1.size * 0.45;

  const d1 = distanceToTarget(state, "p1");
  const d2 = distanceToTarget(state, "p2");

  if (d1 <= hit && d2 <= hit) {
    // both touched same tick -> give point to closest
    return d1 <= d2 ? "p1" : "p2";
  }
  if (d1 <= hit) return "p1";
  if (d2 <= hit) return "p2";
  return null;
}

export function scorePoint(state: ArenaState, scorer: Side) {
  state.score[scorer] += 1;
  respawnTarget(state);

  // reset players a bit so they don't instantly score again
  const { W, H } = ArenaConfig.CANVAS;
  state.p1.x = W * 0.25;
  state.p1.y = H / 2;
  state.p2.x = W * 0.75;
  state.p2.y = H / 2;
}

export function isGameOver(state: ArenaState) {
  return (
    state.score.p1 >= ArenaConfig.WIN_SCORE || state.score.p2 >= ArenaConfig.WIN_SCORE
  );
}
