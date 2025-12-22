import { WebSocket } from "ws";
import arenaRepository from "./arena.repository";
import { ArenaConfig } from "./arena.config";
import {
  initArenaState,
  applyMove,
  checkScore,
  scorePoint,
  isGameOver,
} from "./arena.physics";
import type { ArenaMode, ArenaPlayer, ClientMessage, Side } from "./arena.types";

// ===================
// In-memory runtime
// ===================
type Keys = { up: boolean; down: boolean; left: boolean; right: boolean };

type Match = {
  arenaGameId: number;
  mode: ArenaMode;
  players: { p1: ArenaPlayer; p2: ArenaPlayer }; // p2 can be AI
  ready: { p1: boolean; p2: boolean };
  keys: { p1: Keys; p2: Keys };
  loop?: NodeJS.Timeout;
  countdown?: NodeJS.Timeout;
  state: ReturnType<typeof initArenaState>;
};

const players = new Map<number, ArenaPlayer>();
const matches = new Map<number, Match>();
const remoteQueue: ArenaPlayer[] = [];

// ============= utils
function send(player: ArenaPlayer | undefined, message: any) {
  if (player?.socket?.readyState === WebSocket.OPEN) {
    player.socket.send(JSON.stringify(message));
  }
}
function broadcast(match: Match, message: any) {
  send(match.players.p1, message);
  send(match.players.p2, message);
}
function getMatch(userId: number): Match | undefined {
  const p = players.get(userId);
  return p?.arenaGameId ? matches.get(p.arenaGameId) : undefined;
}
function getSide(userId: number, match: Match): Side | null {
  if (match.players.p1.id === userId) return "p1";
  if (match.players.p2.id === userId) return "p2";
  return null;
}
function stop(match: Match) {
  if (match.loop) clearInterval(match.loop);
  match.loop = undefined;
  if (match.countdown) clearInterval(match.countdown);
  match.countdown = undefined;
}

// =================== AI
function aiUpdate(match: Match) {
  if (match.mode !== "ai") return;

  // p2 is AI; move toward target
  const state = match.state;
  const ai = state.p2;
  const t = state.target;

  const dx = t.x - ai.x;
  const dy = t.y - ai.y;

  const len = Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
  const nx = dx / len;
  const ny = dy / len;

  // convert direction -> pseudo keys
  const k = match.keys.p2;
  const reaction = ArenaConfig.AI.REACTION;
  const wander = ArenaConfig.AI.WANDER;

  const wantX = nx + (Math.random() - 0.5) * wander;
  const wantY = ny + (Math.random() - 0.5) * wander;

  k.left = wantX < -reaction;
  k.right = wantX > reaction;
  k.up = wantY < -reaction;
  k.down = wantY > reaction;
}

// =================== game loop
async function endGame(match: Match, winnerSide: Side) {
  stop(match);

  const winnerUserId =
    winnerSide === "p1" ? match.players.p1.id : match.players.p2.isAI ? null : match.players.p2.id;

  try {
    // persist scores
    await arenaRepository.updatePlayerScore(match.arenaGameId, 1, match.state.score.p1);
    await arenaRepository.updatePlayerScore(match.arenaGameId, 2, match.state.score.p2);

    await arenaRepository.finish(match.arenaGameId, winnerUserId ?? null);

    broadcast(match, { type: "gameOver", winner: winnerSide, score: match.state.score });

    matches.delete(match.arenaGameId);

    // cleanup p1/p2
    match.players.p1.arenaGameId = undefined;
    match.players.p2.arenaGameId = undefined;
  } catch (e) {
    console.error("Arena endGame error:", e);
  }
}

function startLoop(match: Match) {
  match.loop = setInterval(() => {
    match.state.tick++;

    // AI decisions first
    aiUpdate(match);

    // apply moves
    applyMove(match.state, "p1", match.keys.p1);
    applyMove(match.state, "p2", match.keys.p2);

    // scoring
    const scorer = checkScore(match.state);
    if (scorer) {
      scorePoint(match.state, scorer);

      if (isGameOver(match.state)) {
        void endGame(match, match.state.score.p1 >= ArenaConfig.WIN_SCORE ? "p1" : "p2");
        return;
      }
    }

    broadcast(match, { type: "state", state: match.state });
  }, ArenaConfig.TICK_MS);
}

function startCountdown(match: Match) {
  let c = ArenaConfig.COUNTDOWN;
  broadcast(match, { type: "countdown", count: c });

  match.countdown = setInterval(() => {
    c--;
    if (c <= 0) {
      broadcast(match, { type: "countdown", count: 0 });
      if (match.countdown) clearInterval(match.countdown);
      match.countdown = undefined;
      startLoop(match);
      return;
    }
    broadcast(match, { type: "countdown", count: c });
  }, 1000);
}

// =================== matchmaking
async function createMatchRemote(p1: ArenaPlayer, p2: ArenaPlayer) {
  const arenaGameId = await arenaRepository.createGame("remote");
  await arenaRepository.addPlayers(arenaGameId, [
    { user_id: p1.id, position: 1, is_ai: false },
    { user_id: p2.id, position: 2, is_ai: false },
  ]);

  const match: Match = {
    arenaGameId,
    mode: "remote",
    players: { p1, p2 },
    ready: { p1: false, p2: false },
    keys: {
      p1: { up: false, down: false, left: false, right: false },
      p2: { up: false, down: false, left: false, right: false },
    },
    state: initArenaState(),
  };

  matches.set(arenaGameId, match);
  p1.arenaGameId = arenaGameId;
  p2.arenaGameId = arenaGameId;

  // tell players
  const base = {
    type: "matchFound",
    arenaGameId,
    mode: "remote" as const,
    playerNames: { p1: p1.username, p2: p2.username },
    playerAvatars: { p1: p1.avatar ?? null, p2: p2.avatar ?? null },
  };

  send(p1, { ...base, side: "p1" });
  send(p2, { ...base, side: "p2" });
}

async function createMatchAI(p1: ArenaPlayer) {
  const arenaGameId = await arenaRepository.createGame("ai");
  await arenaRepository.addPlayers(arenaGameId, [
    { user_id: p1.id, position: 1, is_ai: false },
    { user_id: null, position: 2, is_ai: true },
  ]);

  const aiPlayer: ArenaPlayer = {
    id: -arenaGameId, // unique non-user id
    username: "AI",
    avatar: null,
    isAI: true,
  };

  const match: Match = {
    arenaGameId,
    mode: "ai",
    players: { p1, p2: aiPlayer },
    ready: { p1: false, p2: true }, // AI auto-ready
    keys: {
      p1: { up: false, down: false, left: false, right: false },
      p2: { up: false, down: false, left: false, right: false },
    },
    state: initArenaState(),
  };

  matches.set(arenaGameId, match);
  p1.arenaGameId = arenaGameId;

  send(p1, {
    type: "matchFound",
    arenaGameId,
    mode: "ai",
    side: "p1",
    playerNames: { p1: p1.username, p2: "AI" },
    playerAvatars: { p1: p1.avatar ?? null, p2: null },
  });
}

// =================== public API
export async function arenaHandleMessage(userId: number, data: ClientMessage, socket: WebSocket) {
  if (data.type === "join") {
    const p: ArenaPlayer = {
      id: userId,
      username: data.username,
      avatar: data.avatar ?? null,
      socket,
      mode: data.mode,
      isAI: false,
    };
    players.set(userId, p);

    if (data.mode === "remote") {
      remoteQueue.push(p);
      if (remoteQueue.length >= 2) {
        const p1 = remoteQueue.shift()!;
        const p2 = remoteQueue.shift()!;
        await createMatchRemote(p1, p2);
      }
    } else {
      await createMatchAI(p);
    }
    return;
  }

  const player = players.get(userId);
  if (!player) {
    socket.close(1008, "Arena player not registered");
    return;
  }
  player.socket = socket;

  const match = getMatch(userId);
  if (!match) return;

  const side = getSide(userId, match);
  if (!side) return;

  if (data.type === "ready") {
    match.ready[side] = true;
    if (match.ready.p1 && match.ready.p2) {
      try {
        await arenaRepository.start(match.arenaGameId);
      } catch {}
      startCountdown(match);
    }
    return;
  }

  if (data.type === "move") {
    match.keys[side].up = !!data.up;
    match.keys[side].down = !!data.down;
    match.keys[side].left = !!data.left;
    match.keys[side].right = !!data.right;
    return;
  }

  if (data.type === "leave") {
    arenaCleanup(userId);
    return;
  }

  if (data.type === "playAgain") {
    // simplest: leave and rejoin
    const mode = data.mode;
    const username = player.username;
    const avatar = player.avatar ?? null;
    const sock = player.socket!;
    arenaCleanup(userId);
    await arenaHandleMessage(userId, { type: "join", mode, username, avatar }, sock);
    return;
  }
}

function removeFromQueue(userId: number) {
  const idx = remoteQueue.findIndex(p => p.id === userId);
  if (idx >= 0) remoteQueue.splice(idx, 1);
}

async function forfeitIfNeeded(userId: number, match: Match) {
  stop(match);

  const remainingSide: Side = match.players.p1.id === userId ? "p2" : "p1";
  const remaining = match.players[remainingSide];

  // if AI or still connected, award win to remaining
  if (remaining.isAI || remaining.socket?.readyState === WebSocket.OPEN) {
    if (!remaining.isAI) send(remaining, { type: "opponentLeft" });
    await endGame(match, remainingSide);
  } else {
    await arenaRepository.cancel(match.arenaGameId);
    matches.delete(match.arenaGameId);
  }
}

export function arenaCleanup(userId: number) {
  const player = players.get(userId);
  if (!player) return;

  removeFromQueue(userId);

  const match = getMatch(userId);
  if (match) {
    void forfeitIfNeeded(userId, match);
  }

  player.arenaGameId = undefined;
}

export function arenaRemovePlayer(userId: number) {
  arenaCleanup(userId);
  players.delete(userId);
}
