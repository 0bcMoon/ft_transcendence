import WebSocket from "ws";
import arenaRepository from "./repository/arenaRepository";
import { ArenaState } from "./arena.state";

type InputState = { up: boolean; down: boolean; left: boolean; right: boolean };

export type AiBrainState = {
  nextThinkAt: number;
  committedUntil: number;
  input: InputState;
  aimOffsetX: number;
  aimOffsetY: number;
  nextOffsetAt: number;
};


type ArenaRoom = {
  state: ArenaState;
  sockets: Map<number, WebSocket>;
  spectators: Map<number, WebSocket>;
  inputs: Map<number, InputState>;
  tick?: NodeJS.Timeout;
  lastPersistAt: number;
  roundLockUntil?: number;
  startLockUntil?: number;
  p2IsAi: boolean;
  aiBrain?: AiBrainState;
  _tickBusy: boolean;
};


const arenaRooms = new Map<number, ArenaRoom>();

const ARENA_W = 800;
const ARENA_H = 600;

const TICK_MS = 1000 / 30;
const SPEED = 8;
const PERSIST_EVERY_MS = 700;

const PLAYER_RADIUS = 18;
const TARGET_RADIUS = 16;

const START_LOCK_MS = 2850; // 3..2..1 + GO display (~800*3 + 450)

const zeroInput = (): InputState => ({ up: false, down: false, left: false, right: false });

function aiVirtualUserId(position: number) {
  return -position;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnTargetSafe(players: { x: number; y: number }[]) {
  const reach = PLAYER_RADIUS + TARGET_RADIUS + 10;
  const reach2 = reach * reach;

  for (let i = 0; i < 50; i++) {
    const t = {
      x: randomInt(40, ARENA_W - 40),
      y: randomInt(40, ARENA_H - 40),
    };
    const tooClose = players.some((p) => dist2(p.x, p.y, t.x, t.y) <= reach2);
    if (!tooClose) return t;
  }

  return {
    x: randomInt(40, ARENA_W - 40),
    y: randomInt(40, ARENA_H - 40),
  };
}

function broadcastState(room: ArenaRoom) {
  const payload = JSON.stringify({ type: "arena:state", state: room.state });

  //for players
  for (const socket of room.sockets.values())
    socket.send(payload);
  // for watchers
  for (const socket of room.spectators.values())
    socket.send(payload);
}

function stopTick(room: ArenaRoom) {
  if (room.tick) clearInterval(room.tick);
  room.tick = undefined;
}

export function ensureTick(room: ArenaRoom) {
  if (room.tick) return;

  room.tick = setInterval(() => {
    void tickOnce(room);
  }, TICK_MS);
}

async function tickOnce(room: ArenaRoom) {
  if ((room as ArenaRoom)._tickBusy) 
    return;
  
  (room as ArenaRoom)._tickBusy = true;

  try {
    //no one watch or play (turn off the light)
    if (room.sockets.size === 0 && room.spectators.size === 0) return;

    // finished or cancelled
    if (handleTerminalStatus(room)) return;
    
    // waiting
    if (handleNonPlaying(room)) return;
    
    // freezing the ai during countdown
    if (handleStartLock(room)) return;
    
    // ensure target exists
    await ensureTarget(room);

    // AI controller (sets inputs for AI players)
    updateAiInputs(room);

    // move players
    applyMovement(room);

    // prevent double wins
    if (handleRoundLock(room)) return;

    // reach target (handle round win / finish / new target)
    const reachOutcome = await maybeHandleTargetReach(room);
    if (reachOutcome !== "none") return;

    // persist positions throttled
    await maybePersistPositions(room);

    // broadcast
    broadcastState(room);
  } finally {
    (room as ArenaRoom)._tickBusy = false;
  }
}

function handleTerminalStatus(room: ArenaRoom) {
  if (room.state.status === "finished" || room.state.status === "cancelled") {
    broadcastState(room);
    stopTick(room);
    return true;
  }
  return false;
}

function handleNonPlaying(room: ArenaRoom) {
  if (room.state.status !== "playing") {
    broadcastState(room);
    return true;
  }
  return false;
}

function handleStartLock(room: ArenaRoom) {
  if (room.startLockUntil && Date.now() < room.startLockUntil) {
    broadcastState(room);
    return true;
  }
  return false;
}

async function ensureTarget(room: ArenaRoom) {
  if (!room.state.target) {
    room.state.target = spawnTargetSafe(room.state.players);
    await arenaRepository.addEvent(room.state.gameId, "target_spawned", room.state.target);
  }
}
function updateAiInputs(room: ArenaRoom) {
  // ignore no ai players
  if (!room.p2IsAi) return;

  const target = room.state.target;
  if (!target) return;

  const aiPlayer = room.state.players.find((p) => p.position === 2);
  if (!aiPlayer) return;

  // playerAi id should be negative
  if (aiPlayer.userId > 0) return;

  const aiId = aiPlayer.userId;
  const now = Date.now();

  // const for the aiBrain
  const REACTION_MIN = 160;
  const REACTION_MAX = 260;

  const COMMIT_MIN = 180;
  const COMMIT_MAX = 340;

  const OFFSET_REFRESH_MIN = 450;
  const OFFSET_REFRESH_MAX = 1100;
  const OFFSET_MAX = 46;

  const DEADZONE = 2;

  if (!room.aiBrain) {
    room.aiBrain = {
      nextThinkAt: now + rand(REACTION_MIN, REACTION_MAX),
      committedUntil: 0,
      input: zeroInput(),

      aimOffsetX: rand(-OFFSET_MAX, OFFSET_MAX),
      aimOffsetY: rand(-OFFSET_MAX, OFFSET_MAX),
      nextOffsetAt: now + rand(OFFSET_REFRESH_MIN, OFFSET_REFRESH_MAX),
    };
  }

  const brain = room.aiBrain;

  if (now >= brain.nextOffsetAt) {
    brain.aimOffsetX = rand(-OFFSET_MAX, OFFSET_MAX);
    brain.aimOffsetY = rand(-OFFSET_MAX, OFFSET_MAX);
    brain.nextOffsetAt = now + rand(OFFSET_REFRESH_MIN, OFFSET_REFRESH_MAX);
  }


  if (now < brain.nextThinkAt) {
    room.inputs.set(aiId, brain.input);
    return;
  }

  if (now < brain.committedUntil) {
    room.inputs.set(aiId, brain.input);
    brain.nextThinkAt = now + rand(REACTION_MIN, REACTION_MAX);
    return;
  }

  const aimX = target.x + brain.aimOffsetX;
  const aimY = target.y + brain.aimOffsetY;

  const dx = aimX - aiPlayer.x;
  const dy = aimY - aiPlayer.y;

  const next: InputState = zeroInput();

  if (dx < -DEADZONE) next.left = true;
  else if (dx > DEADZONE) next.right = true;

  if (dy < -DEADZONE) next.up = true;
  else if (dy > DEADZONE) next.down = true;

  if (Math.random() < 0.08) {
    next.up = next.down = next.left = next.right = false;
  } else if (Math.random() < 0.05) {
    if (next.left || next.right) {
      const wasLeft = next.left;
      next.left = next.right;
      next.right = wasLeft;
    } else if (next.up || next.down) {
      const wasUp = next.up;
      next.up = next.down;
      next.down = wasUp;
    }
  }

  brain.input = next;
  brain.committedUntil = now + rand(COMMIT_MIN, COMMIT_MAX);
  brain.nextThinkAt = now + rand(REACTION_MIN, REACTION_MAX);

  room.inputs.set(aiId, brain.input);
}

function applyMovement(room: ArenaRoom) {
  for (const p of room.state.players) {
    const input = room.inputs.get(p.userId) ?? zeroInput();

    let speed = SPEED;

    let dx = 0;
    let dy = 0;

    if (input.left) dx -= speed;
    if (input.right) dx += speed;
    if (input.up) dy -= speed;
    if (input.down) dy += speed;

    p.x = clamp(p.x + dx, PLAYER_RADIUS, ARENA_W - PLAYER_RADIUS);
    p.y = clamp(p.y + dy, PLAYER_RADIUS, ARENA_H - PLAYER_RADIUS);
  }
}


function handleRoundLock(room: ArenaRoom) {
  const nowRound = Date.now();
  if (room.roundLockUntil && nowRound < room.roundLockUntil) {
    broadcastState(room);
    return true;
  }
  return false;
}

async function maybeHandleTargetReach(room: ArenaRoom): Promise<"none" | "handled" | "stopped"> {
  if (!room.state.target) return "none";

  const t = room.state.target;
  const reach = PLAYER_RADIUS + TARGET_RADIUS;
  const reach2 = reach * reach;

  const winner = room.state.players.find((p) => dist2(p.x, p.y, t.x, t.y) <= reach2);
  if (!winner)
    return "none";

  // block the target for a moment
  room.roundLockUntil = Date.now() + 250;

  winner.roundsWon += 1;
  await arenaRepository.incrementRoundWin(room.state.gameId, winner.position as 1 | 2);

  await arenaRepository.addEvent(room.state.gameId, "round_won", {
    userId: winner.userId,
    position: winner.position,
    roundsWon: winner.roundsWon,
  });

  // game finished
  if (winner.roundsWon >= room.state.targetRoundWins) {
    room.state.status = "finished";
    room.state.target = null;

    const winnerUserIdForDb = winner.userId > 0 ? winner.userId : null; // AI userId is null in database
    await arenaRepository.finish(room.state.gameId, winnerUserIdForDb);
    await arenaRepository.addEvent(room.state.gameId, "finished", {
      winnerUserId: winnerUserIdForDb,
      winnerPosition: winner.position,
    });

    broadcastState(room);
    stopTick(room);
    return "stopped";
  }

  // next round target
  room.state.target = spawnTargetSafe(room.state.players);
  await arenaRepository.addEvent(room.state.gameId, "target_spawned", room.state.target);

  broadcastState(room);
  return "handled";
}

async function maybePersistPositions(room: ArenaRoom) {
  const now = Date.now();
  if (now - room.lastPersistAt < PERSIST_EVERY_MS) return;

  room.lastPersistAt = now;
  for (const p of room.state.players) {
    const pos = p.position as 1 | 2;
    await arenaRepository.setPlayerLastPosition(room.state.gameId, pos, p.x, p.y);
  }
}


export async function handleArenaMessage(userId: number, msg: any, socket: WebSocket) {
  if (msg?.type === "arena:join") {
    await handleJoin(userId, msg, socket);
    return;
  }

  if (msg?.type === "arena:input") {
    handleInput(userId, msg);
    return;
  }
}

/* --- JOIN --- */

async function handleJoin(userId: number, msg: any, socket: WebSocket) {
  const gameId = parseGameId(msg, socket);
  if (!gameId) return;

  const spectate = !!msg.spectate;

  const detail = await getGameDetailOrError(gameId, socket);
  if (!detail) return;

  const dbPlayers = await arenaRepository.getGamePlayers(gameId);

  if (!isAllowedToJoin(userId, dbPlayers, spectate)) {
    socket.send(JSON.stringify({ type: "arena:error", message: "You are not part of this arena game" }));
    return;
  }

  const room = getOrCreateRoom(gameId, detail, dbPlayers);

  if (spectate) {
    joinAsSpectator(userId, socket, room);
    return;
  }

  await joinAsPlayerAndMaybeStart(userId, socket, room, dbPlayers);
}

function parseGameId(msg: any, socket: WebSocket): number | null {
  const gameId = Number(msg?.gameId);
  if (!gameId || Number.isNaN(gameId)) {
    socket.send(JSON.stringify({ type: "arena:error", message: "Invalid gameId" }));
    return null;
  }
  return gameId;
}

async function getGameDetailOrError(gameId: number, socket: WebSocket) {
  const detail = await arenaRepository.getGameDetail(gameId);
  if (!detail) {
    socket.send(JSON.stringify({ type: "arena:error", message: "Arena game not found" }));
    return null;
  }
  return detail;
}

function isAllowedToJoin(
  userId: number,
  dbPlayers: Array<{ user_id: number | null; is_ai: any }>,
  spectate: boolean
) {
  if (spectate) return true;
  return dbPlayers.some((p) => p.user_id === userId);
}

function getOrCreateRoom(gameId: number, detail: any, dbPlayers: any[]): ArenaRoom {
  let room = arenaRooms.get(gameId);
  if (room) return room;

  const isAiDbPlayer = (p: any) => !!p.is_ai;
  const p2Db = dbPlayers.find((p) => p.position === 2);
  const p2IsAi = !!p2Db?.is_ai;


  room = {
    sockets: new Map(),
    spectators: new Map(),
    inputs: new Map(),
    lastPersistAt: Date.now(),
    p2IsAi,
    _tickBusy: false,

    state: {
      gameId,
      status: detail.status,
      target: null,
      targetRoundWins: detail.target_round_wins ?? 5,
      players: dbPlayers.map((p) => {
        const defaultX = p.position === 1 ? 100 : 700;
        const defaultY = 300;

        const x = typeof p.last_x === "number" && p.last_x !== 0 ? p.last_x : defaultX;
        const y = typeof p.last_y === "number" && p.last_y !== 0 ? p.last_y : defaultY;

        const userIdForState = p.is_ai ? aiVirtualUserId(p.position) : (p.user_id as number);

        return {
          userId: userIdForState,
          position: p.position,
          x,
          y,
          roundsWon: p.round_wins ?? 0,
        };
      }),
    },
  };


  arenaRooms.set(gameId, room);
  return room;
}

function joinAsSpectator(userId: number, socket: WebSocket, room: ArenaRoom) {
  room.spectators.set(userId, socket);
  socket.send(JSON.stringify({ type: "arena:joined", role: "spectator", playerPosition: null }));
  broadcastState(room);

  if (room.state.status === "playing") ensureTick(room);
}

async function joinAsPlayerAndMaybeStart(userId: number, socket: WebSocket, room: ArenaRoom, dbPlayers: any[]) {
  room.sockets.set(userId, socket);
  room.inputs.set(userId, zeroInput());

  ensureInputsForAllStatePlayers(room);

  const me = dbPlayers.find((p) => p.user_id === userId);
  socket.send(JSON.stringify({ type: "arena:joined", role: "player", playerPosition: me?.position ?? null }));

  const allHumansConnected = computeAllHumansConnected(room, dbPlayers);
  const canStart = room.state.players.length === 2 && allHumansConnected;

  if (canStart && room.state.status === "waiting") {
    await startMatch(room);
    ensureTick(room);
  } else {
    broadcastState(room);
    if (room.state.status === "playing") ensureTick(room);
  }
}

function ensureInputsForAllStatePlayers(room: ArenaRoom) {
  for (const p of room.state.players) {
    if (!room.inputs.has(p.userId)) room.inputs.set(p.userId, zeroInput());
  }
}

function computeAllHumansConnected(room: ArenaRoom, dbPlayers: any[]) {
  const p1Db = dbPlayers.find((p) => p.position === 1);
  const p2Db = dbPlayers.find((p) => p.position === 2);

  const p2IsAi = !!p2Db?.is_ai;

  const requiredHumanUserIds: number[] = [];

  if (p1Db?.user_id != null) requiredHumanUserIds.push(p1Db.user_id);

  if (!p2IsAi) {
    const p2HumanId = p2Db?.user_id;
    if (p2HumanId != null) requiredHumanUserIds.push(p2HumanId);
  }

  return requiredHumanUserIds.every((uid) => room.sockets.has(uid));
}

async function startMatch(room: ArenaRoom) {
  const gameId = room.state.gameId;

  room.state.status = "playing";
  room.startLockUntil = Date.now() + START_LOCK_MS;

  await arenaRepository.start(gameId);
  await arenaRepository.addEvent(gameId, "started", { by: "auto" });

  room.state.target = spawnTargetSafe(room.state.players);
  await arenaRepository.addEvent(gameId, "target_spawned", room.state.target);
}

/* --- INPUT --- */

function handleInput(userId: number, msg: any) {
  const gameId = Number(msg?.gameId);
  if (!gameId || Number.isNaN(gameId)) return;

  const room = arenaRooms.get(gameId);
  if (!room) return;

  // only allow input from actual players
  if (!room.sockets.has(userId)) return;

  const input = msg.input as Partial<InputState> | undefined;
  if (!input || typeof input !== "object") return;

  room.inputs.set(userId, {
    up: !!input.up,
    down: !!input.down,
    left: !!input.left,
    right: !!input.right,
  });
}

export function removeArenaPlayer(userId: number) {
  for (const [gameId, room] of arenaRooms.entries()) {
    if (!room.sockets.has(userId)) continue;

    room.sockets.delete(userId);
    room.inputs.delete(userId);

    if (room.state.status === "playing") {
      room.state.status = "cancelled";
      room.state.target = null;

      arenaRepository
        .cancel(gameId)
        .then(() => arenaRepository.addEvent(gameId, "player_left", { userId }))
        .catch(() => {});

      broadcastState(room);
      stopTick(room);
    }

    if (room.sockets.size === 0 && room.spectators.size === 0) {
      stopTick(room);
      arenaRooms.delete(gameId);
    }

    return;
  }
}

export function removeArenaSpectator(userId: number) {
  for (const [gameId, room] of arenaRooms.entries()) {
    if (!room.spectators.has(userId)) continue;

    room.spectators.delete(userId);

    if (room.sockets.size === 0 && room.spectators.size === 0) {
      stopTick(room);
      arenaRooms.delete(gameId);
    }

    return;
  }
}
