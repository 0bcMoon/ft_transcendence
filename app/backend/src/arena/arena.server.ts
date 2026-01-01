// backend/src/arena/arena.server.ts
import WebSocket from "ws";
import arenaRepository from "./repository/arenaRepository";
import { ArenaState } from "./arena.state";

type InputState = { up: boolean; down: boolean; left: boolean; right: boolean };



type ArenaRoom = {
  state: ArenaState;
  sockets: Map<number, WebSocket>;        // userId -> socket
  inputs: Map<number, InputState>;        // userId -> last input
  tick?: NodeJS.Timeout;
  lastPersistAt: number;

  roundLockUntil?: number;
};




const arenaRooms = new Map<number, ArenaRoom>();



// --- Arena bounds (match your frontend canvas later)
const ARENA_W = 800;
const ARENA_H = 600;

// --- Tick + movement
const TICK_MS = 1000 / 30;     // 30fps
const SPEED = 6;               // px per tick
const PERSIST_EVERY_MS = 700;  // throttle DB writes

// --- Reach detection (tune later)
const PLAYER_RADIUS = 18;
const TARGET_RADIUS = 16;

const zeroInput = (): InputState => ({ up: false, down: false, left: false, right: false });

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

function spawnTarget() {
  return {
    x: randomInt(90, ARENA_W - 90),
    y: randomInt(90, ARENA_H - 90),
  };
}

function spawnTargetSafe(players: { x: number; y: number }[]) {
  const reach = PLAYER_RADIUS + TARGET_RADIUS + 10; // +10px safety margin
  const reach2 = reach * reach;

  for (let i = 0; i < 50; i++) {
    const t = {
      x: randomInt(40, ARENA_W - 40),
      y: randomInt(40, ARENA_H - 40),
    };

    const tooClose = players.some((p) => dist2(p.x, p.y, t.x, t.y) <= reach2);
    if (!tooClose) return t;
  }

  // fallback if we fail many tries
  return {
    x: randomInt(40, ARENA_W - 40),
    y: randomInt(40, ARENA_H - 40),
  };
}


function broadcastState(room: ArenaRoom) {
  const payload = JSON.stringify({ type: "arena:state", state: room.state });
  for (const socket of room.sockets.values()) socket.send(payload);
}

function stopTick(room: ArenaRoom) {
  if (room.tick) clearInterval(room.tick);
  room.tick = undefined;
}

function ensureTick(room: ArenaRoom) {
  if (room.tick) return;
  console.log("[ARENA] start tick for game", room.state.gameId);

  room.tick = setInterval(async () => {
    // do nothing if no one connected
    if (room.sockets.size === 0) return;

    // stop sim when finished/cancelled
    if (room.state.status === "finished" || room.state.status === "cancelled") {
      broadcastState(room);
      stopTick(room);
      return;
    }

    // only simulate in playing
    if (room.state.status !== "playing") {
      broadcastState(room);
      return;
    }

    // spawn target if missing
    if (!room.state.target) {
      room.state.target = spawnTargetSafe(room.state.players);
      await arenaRepository.addEvent(room.state.gameId, "target_spawned", room.state.target);
    }

    // apply inputs -> movement
    for (const p of room.state.players) {
      const input = room.inputs.get(p.userId) ?? zeroInput();

      let dx = 0;
      let dy = 0;

      if (input.left) dx -= SPEED;
      if (input.right) dx += SPEED;
      if (input.up) dy -= SPEED;
      if (input.down) dy += SPEED;

      p.x = clamp(p.x + dx, 0, ARENA_W);
      p.y = clamp(p.y + dy, 0, ARENA_H);
    }

    // ✅ cooldown: prevent instant double-win across consecutive ticks
    const nowRound = Date.now();
    if (room.roundLockUntil && nowRound < room.roundLockUntil) {
      // still persist position throttled + broadcast (optional)
      broadcastState(room);
      return;
    }
    
    
    // check reach target
    if (room.state.target) {
      const t = room.state.target;
      const reach = PLAYER_RADIUS + TARGET_RADIUS;
      const reach2 = reach * reach;

      const winner = room.state.players.find(
        (p) => dist2(p.x, p.y, t.x, t.y) <= reach2
      );

      if (winner) {
        room.roundLockUntil = Date.now() + 250;
      
        winner.roundsWon += 1;
        await arenaRepository.incrementRoundWin(room.state.gameId, winner.position as 1 | 2);
      
        await arenaRepository.addEvent(room.state.gameId, "round_won", {
          userId: winner.userId,
          position: winner.position,
          roundsWon: winner.roundsWon,
        });
      
        if (winner.roundsWon >= room.state.targetRoundWins) {
          room.state.status = "finished";
          room.state.target = null;
      
          await arenaRepository.finish(room.state.gameId, winner.userId);
          await arenaRepository.addEvent(room.state.gameId, "finished", { winnerUserId: winner.userId });
      
          broadcastState(room);
          stopTick(room);
          return;
        }
      
        // next round: new target (safe)
        room.state.target = spawnTargetSafe(room.state.players);
        await arenaRepository.addEvent(room.state.gameId, "target_spawned", room.state.target);
      
        broadcastState(room);
        return; // ✅ prevents second win on next tick from same position
      }
      

    }

    // persist positions throttled
    const now = Date.now();
    if (now - room.lastPersistAt >= PERSIST_EVERY_MS) {
      room.lastPersistAt = now;
      for (const p of room.state.players) {
        const pos = p.position as 1 | 2;
        await arenaRepository.setPlayerLastPosition(room.state.gameId, pos, p.x, p.y);
      }
    }

    // broadcast every tick for now
    broadcastState(room);
  }, TICK_MS);
}

export async function handleArenaMessage(userId: number, msg: any, socket: WebSocket) {
  // ---------------- join ----------------
  if (msg.type === "arena:join") {
    const gameId = Number(msg.gameId);
    if (!gameId || Number.isNaN(gameId)) {
      socket.send(JSON.stringify({ type: "arena:error", message: "Invalid gameId" }));
      return;
    }

    // prevent same user connected to multiple rooms
    for (const [otherGameId, room] of arenaRooms.entries()) {
      if (room.sockets.has(userId) && otherGameId !== gameId) {
        socket.send(JSON.stringify({ type: "arena:error", message: "Already connected to another arena game" }));
        return;
      }
    }

    const detail = await arenaRepository.getGameDetail(gameId);
    if (!detail) {
      socket.send(JSON.stringify({ type: "arena:error", message: "Arena game not found" }));
      return;
    }

    const players = await arenaRepository.getGamePlayers(gameId);
    const me = players.find((p) => p.user_id === userId);

    if (!me) {
      socket.send(JSON.stringify({ type: "arena:error", message: "You are not part of this arena game" }));
      return;
    }

    let room = arenaRooms.get(gameId);

    // Create room on first join
    if (!room) {
      room = {
        sockets: new Map(),
        inputs: new Map(),
        lastPersistAt: Date.now(),
        state: {
          gameId,
          status: detail.status, // "waiting" initially
          target: null,
          targetRoundWins: detail.target_round_wins ?? 5,
          players: players
            .filter((p) => p.user_id !== null)
            .map((p) => {
              const defaultX = p.position === 1 ? 100 : 700;
              const defaultY = 300;

              // ✅ important: if DB defaults 0, treat as "not set yet"
              const x = (typeof p.last_x === "number" && p.last_x !== 0) ? p.last_x : defaultX;
              const y = (typeof p.last_y === "number" && p.last_y !== 0) ? p.last_y : defaultY;


              return {
                userId: p.user_id!,
                position: p.position,
                x,
                y,
                roundsWon: p.round_wins ?? 0,
              };
            }),
        },
      };

      arenaRooms.set(gameId, room);
    }

    // attach socket + init input
    room.sockets.set(userId, socket);
    room.inputs.set(userId, zeroInput());

    socket.send(JSON.stringify({ type: "arena:joined", playerPosition: me.position }));

    // Auto-start when both players connected
    const bothConnected =
      room.state.players.length === 2 &&
      room.state.players.every((p) => room.sockets.has(p.userId));

    if (bothConnected && room.state.status === "waiting") {
      room.state.status = "playing";
      await arenaRepository.start(gameId);
      await arenaRepository.addEvent(gameId, "started", { by: "auto" });

      // spawn first target immediately (optional, but nicer)
      room.state.target = spawnTargetSafe(room.state.players);

      await arenaRepository.addEvent(gameId, "target_spawned", room.state.target);

      ensureTick(room);
    } else {
      // even if waiting, broadcast once so UI sees who joined
      broadcastState(room);
    }

    return;
  }

  // ---------------- input ----------------
  if (msg.type === "arena:input") {
    const gameId = Number(msg.gameId);
    if (!gameId || Number.isNaN(gameId)) return;

    const room = arenaRooms.get(gameId);
    if (!room) return;

    if (!room.sockets.has(userId)) return;

    const input = msg.input as Partial<InputState> | undefined;
    if (!input || typeof input !== "object") return;

    room.inputs.set(userId, {
      up: !!input.up,
      down: !!input.down,
      left: !!input.left,
      right: !!input.right,
    });

    return;
  }
}

export function removeArenaPlayer(userId: number) {
  for (const [gameId, room] of arenaRooms.entries()) {
    if (!room.sockets.has(userId)) continue;

    room.sockets.delete(userId);
    room.inputs.delete(userId);

    // if someone leaves during an active match -> cancel
    if (room.state.status === "playing") {
      room.state.status = "cancelled";
      room.state.target = null;

      // fire-and-forget (don’t block close handler)
      arenaRepository.cancel(gameId)
        .then(() => arenaRepository.addEvent(gameId, "player_left", { userId }))
        .catch(() => {});

      broadcastState(room);
      stopTick(room);
    }

    // if room empty, stop tick + delete
    if (room.sockets.size === 0) {
      stopTick(room);
      arenaRooms.delete(gameId);
    }

    return; // user only belongs to one room
  }
}

