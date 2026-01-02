// backend/src/arena/arena.server.ts
import WebSocket from "ws";
import arenaRepository from "./repository/arenaRepository";
import { ArenaState } from "./arena.state";

type InputState = { up: boolean; down: boolean; left: boolean; right: boolean };

type ArenaRoom = {
  state: ArenaState;
  sockets: Map<number, WebSocket>; // userId -> socket
  inputs: Map<number, InputState>; // userId -> last input
  tick?: NodeJS.Timeout;
  lastPersistAt: number;
  roundLockUntil?: number;
  startLockUntil?: number;
  aiPositions?: Set<1 | 2>;

  aiBrain?: {
    // per AI userId
    [aiUserId: number]: {
      nextThinkAt: number;
      committedUntil: number;
      input: InputState;
  
      // human-ness parameters
      aimOffsetX: number;
      aimOffsetY: number;
      nextOffsetAt: number;
  
      // speed feel (optional)
      speedMul: number;
      nextSpeedAt: number;
    };
  };
  
};

const arenaRooms = new Map<number, ArenaRoom>();

// --- Arena bounds (match your frontend canvas)
const ARENA_W = 800;
const ARENA_H = 600;

// --- Tick + movement
const TICK_MS = 1000 / 30; // 30fps
const SPEED = 6; // px per tick
const PERSIST_EVERY_MS = 700; // throttle DB writes

// --- Reach detection
const PLAYER_RADIUS = 18;
const TARGET_RADIUS = 16;
const START_LOCK_MS = 2850;// matches 3-2-1-GO timing (800*3 + 450)

const zeroInput = (): InputState => ({ up: false, down: false, left: false, right: false });

function aiVirtualUserId(position: number) {
  // negative ids won’t collide with real user ids
  return -position; // P2 => -2
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

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clampInt(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
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
    // do nothing if no one connected (AI has no socket, so this is "no humans")
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
    // ✅ Freeze movement during countdown lock
    if (room.startLockUntil && Date.now() < room.startLockUntil) {
      broadcastState(room);
      return;
    }
    

    // spawn target if missing
    if (!room.state.target) {
      room.state.target = spawnTargetSafe(room.state.players);
      await arenaRepository.addEvent(room.state.gameId, "target_spawned", room.state.target);
    }

    // ✅ Human-like AI controller (reaction time + aim error + commitment)
    const aiPos = room.aiPositions ?? new Set<1 | 2>();
    if (!room.aiBrain) room.aiBrain = {};
    
    if (room.state.target) {
      const t = room.state.target;
      const now = Date.now();
    
      // "casual human" constants (easy + beatable)
      const REACTION_MIN = 160;     // ms (slower)
      const REACTION_MAX = 260;
      
      const COMMIT_MIN = 180;       // ms (holds direction longer)
      const COMMIT_MAX = 340;
      
      const OFFSET_REFRESH_MIN = 450;  // ms
      const OFFSET_REFRESH_MAX = 1100;
      const OFFSET_MAX = 46;           // px (bigger aim error)
      
      const SPEED_REFRESH_MIN = 900;   // ms
      const SPEED_REFRESH_MAX = 1800;
      const SPEED_MIN = 0.78;          // generally slower than human
      const SPEED_MAX = 0.98;
      
      const DEADZONE = 14;             // larger deadzone => less twitchy
      
    
      for (const p of room.state.players) {
        if (!aiPos.has(p.position as 1 | 2)) continue;
    
        const aiId = p.userId;
        let brain = room.aiBrain[aiId];
    
        if (!brain) {
          brain = room.aiBrain[aiId] = {
            nextThinkAt: now + rand(REACTION_MIN, REACTION_MAX),
            committedUntil: 0,
            input: zeroInput(),
            aimOffsetX: rand(-OFFSET_MAX, OFFSET_MAX),
            aimOffsetY: rand(-OFFSET_MAX, OFFSET_MAX),
            nextOffsetAt: now + rand(OFFSET_REFRESH_MIN, OFFSET_REFRESH_MAX),
            speedMul: rand(SPEED_MIN, SPEED_MAX),
            nextSpeedAt: now + rand(SPEED_REFRESH_MIN, SPEED_REFRESH_MAX),
          };
        }
    
        // occasionally change "aim error" (like slight misread / imperfect control)
        if (now >= brain.nextOffsetAt) {
          brain.aimOffsetX = rand(-OFFSET_MAX, OFFSET_MAX);
          brain.aimOffsetY = rand(-OFFSET_MAX, OFFSET_MAX);
          brain.nextOffsetAt = now + rand(OFFSET_REFRESH_MIN, OFFSET_REFRESH_MAX);
        }
    
        // occasionally change speed "mood"
        if (now >= brain.nextSpeedAt) {
          brain.speedMul = rand(SPEED_MIN, SPEED_MAX);
          brain.nextSpeedAt = now + rand(SPEED_REFRESH_MIN, SPEED_REFRESH_MAX);
        }
    
        // only "think" on reaction intervals
        if (now < brain.nextThinkAt) {
          // keep last input
          room.inputs.set(aiId, brain.input);
          continue;
        }
    
        // if still committed, don't change direction yet
        if (now < brain.committedUntil) {
          room.inputs.set(aiId, brain.input);
          brain.nextThinkAt = now + rand(REACTION_MIN, REACTION_MAX);
          continue;
        }
    
        // compute target with aim offset
        const aimX = t.x + brain.aimOffsetX;
        const aimY = t.y + brain.aimOffsetY;
    
        const dx = aimX - p.x;
        const dy = aimY - p.y;
    
        const next: InputState = { up: false, down: false, left: false, right: false };
    
        if (dx < -DEADZONE) next.left = true;
        else if (dx > DEADZONE) next.right = true;
    
        if (dy < -DEADZONE) next.up = true;
        else if (dy > DEADZONE) next.down = true;
    
        // tiny chance to "hesitate" for a moment (human pause)
        if (Math.random() < 0.04) {
          next.up = next.down = next.left = next.right = false;
        }
    
        brain.input = next;
        brain.committedUntil = now + rand(COMMIT_MIN, COMMIT_MAX);
        brain.nextThinkAt = now + rand(REACTION_MIN, REACTION_MAX);
    
        room.inputs.set(aiId, brain.input);
      }
    }
    
    
        // apply inputs -> movement
        for (const p of room.state.players) {
          const input = room.inputs.get(p.userId) ?? zeroInput();
    
          let dx = 0;
          let dy = 0;
          let speed = SPEED;

          // If AI, apply its speedMul
          const aiPos = room.aiPositions ?? new Set<1 | 2>();
          if (aiPos.has(p.position as 1 | 2) && room.aiBrain?.[p.userId]) {
            speed = SPEED * room.aiBrain[p.userId].speedMul;
          }
          
          if (input.left) dx -= speed;
          if (input.right) dx += speed;
          if (input.up) dy -= speed;
          if (input.down) dy += speed;
          
          p.x = clamp(p.x + dx, PLAYER_RADIUS, ARENA_W - PLAYER_RADIUS);
          p.y = clamp(p.y + dy, PLAYER_RADIUS, ARENA_H - PLAYER_RADIUS);
          
        }
    
        // cooldown: prevent instant double-win across consecutive ticks
        const nowRound = Date.now();
        if (room.roundLockUntil && nowRound < room.roundLockUntil) {
          broadcastState(room);
          return;
        }
    
        // check reach target
        if (room.state.target) {
          const t = room.state.target;
          const reach = PLAYER_RADIUS + TARGET_RADIUS;
          const reach2 = reach * reach;
    
          const winner = room.state.players.find((p) => dist2(p.x, p.y, t.x, t.y) <= reach2);
    
          if (winner) {
            room.roundLockUntil = Date.now() + 250;
    
            winner.roundsWon += 1;
            await arenaRepository.incrementRoundWin(room.state.gameId, winner.position as 1 | 2);
    
            await arenaRepository.addEvent(room.state.gameId, "round_won", {
              userId: winner.userId, // AI will be negative here (fine for events)
              position: winner.position,
              roundsWon: winner.roundsWon,
            });
    
            if (winner.roundsWon >= room.state.targetRoundWins) {
              room.state.status = "finished";
              room.state.target = null;
    
              // ✅ AI winner => NULL in DB
              const winnerUserIdForDb = winner.userId > 0 ? winner.userId : null;
    
              await arenaRepository.finish(room.state.gameId, winnerUserIdForDb);
              await arenaRepository.addEvent(room.state.gameId, "finished", {
                winnerUserId: winnerUserIdForDb,
                winnerPosition: winner.position,
              });
    
              broadcastState(room);
              stopTick(room);
              return;
            }
    
            // next round: new target (safe)
            room.state.target = spawnTargetSafe(room.state.players);
            await arenaRepository.addEvent(room.state.gameId, "target_spawned", room.state.target);
    
            broadcastState(room);
            return;
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
        socket.send(
          JSON.stringify({ type: "arena:error", message: "Already connected to another arena game" })
        );
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
      const aiPositions = new Set(players.filter((p) => p.is_ai).map((p) => p.position as 1 | 2));

      room = {
        sockets: new Map(),
        inputs: new Map(),
        lastPersistAt: Date.now(),
        aiPositions,
        state: {
          gameId,
          status: detail.status,
          target: null,
          targetRoundWins: detail.target_round_wins ?? 5,
          // ✅ include humans + AI in simulation
          players: players.map((p) => {
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
    }

    // attach socket + init input (human)
    room.sockets.set(userId, socket);
    room.inputs.set(userId, zeroInput());

    // ✅ ensure inputs exist for everyone (including AI)
    for (const p of room.state.players) {
      if (!room.inputs.has(p.userId)) room.inputs.set(p.userId, zeroInput());
    }

    socket.send(JSON.stringify({ type: "arena:joined", playerPosition: me.position }));

    // Auto-start:
    // - PvP: both humans must have sockets
    // - PvAI: only the human(s) must have sockets; AI doesn't need one
    const aiPos = room.aiPositions ?? new Set<1 | 2>();

    const allHumansConnected = room.state.players
      .filter((p) => !aiPos.has(p.position as 1 | 2))
      .every((p) => room.sockets.has(p.userId));

    const canStart = room.state.players.length === 2 && allHumansConnected;

    if (canStart && room.state.status === "waiting") {
      room.state.status = "playing";
      room.startLockUntil = Date.now() + START_LOCK_MS; // ✅ NEW
    
      await arenaRepository.start(gameId);
      await arenaRepository.addEvent(gameId, "started", { by: "auto" });
    
      room.state.target = spawnTargetSafe(room.state.players);
      await arenaRepository.addEvent(gameId, "target_spawned", room.state.target);
    
      ensureTick(room);
    } else {
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

      arenaRepository
        .cancel(gameId)
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

    return;
  }
}
