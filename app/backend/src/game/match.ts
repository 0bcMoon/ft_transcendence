import { WebSocket } from 'ws';
import { /* ... all your types ... */ } from './game.types';
import { /* ... all your physics ... */ } from './game.physics';
import { Rules, Paddle, Canvas, REDIS_KEYS } from './game.config'; // ✅ Import REDIS_KEYS
import { redis } from '../db/redisClient'; // ✅ Import the Redis client
import gameRepository from '../repository/gameRepository'; // Keep your SQL repo

// --- In-Memory State (REMOVED) ---
// const players = new Map<number, Player>(); 
// const matches = new Map<number, ServerMatch>();
// const queue = new Map<GameMode, Player[]>();

// --- Helper Functions (Now Async) ---

async function getPlayerMatch(userId: number): Promise<ServerMatch | null> {
    // 1. Get player data string from Redis
    const playerJSON = await redis.hGet(REDIS_KEYS.PLAYERS, userId.toString());
    if (!playerJSON) return null;

    // 2. Parse player data
    const player: Player = JSON.parse(playerJSON);
    if (!player.gameId) return null;

    // 3. Get match data string from Redis
    const matchJSON = await redis.hGet(REDIS_KEYS.MATCHES, player.gameId.toString());
    if (!matchJSON) return null;

    // 4. Parse and return match data
    return JSON.parse(matchJSON);
}

// getPlayerSide remains the same (it's pure logic)
function getPlayerSide(userId: number, match: ServerMatch): Side | null { /* ... */ }

// moveServerPaddles remains the same (it's pure logic)
function moveServerPaddles(state: GameState, keys: ServerMatch['keys']) { /* ... */ }

/**
 * Saves the final game state to the database and cleans up Redis.
 */
async function persistAndEndGame(match: ServerMatch, winner: Side) {
    if (match.loop) clearInterval(match.loop);

    const winnerId = (winner === "left" ? match.players.left?.id : match.players.right?.id) ?? null;

    try {
        // Use the repository to save final scores
        await gameRepository.updatePlayerScoreByPosition(match.gameId, 1, match.state.score.left);
        await gameRepository.updatePlayerScoreByPosition(match.gameId, 2, match.state.score.right);
        await gameRepository.finishGame(match.gameId, winnerId);
    } catch (err) { /* ... */ }

    // Send final message
    const gameOverMessage = JSON.stringify({ /* ... */ });
    match.players.left?.socket?.send(gameOverMessage);
    match.players.right?.socket?.send(gameOverMessage);

    // ✅ Remove the game from Redis
    await redis.hDel(REDIS_KEYS.MATCHES, match.gameId.toString());
}

async function startGameLoop(gameId: number) {
    let match = await matches.get(gameId); // This is now a problem, needs refactor

    // ...
    // Refactor of startGameLoop
    // ...

    // ✅ Correct, Async-safe Game Loop
    const match = await redis.hGet(REDIS_KEYS.MATCHES, gameId.toString());
    if (!match) return;

    const parsedMatch: ServerMatch = JSON.parse(match);

    parsedMatch.loop = setInterval(async () => {
        // 1. Get the latest match state from Redis (critical for multiple servers)
        const currentMatchJSON = await redis.hGet(REDIS_KEYS.MATCHES, gameId.toString());
        if (!currentMatchJSON) {
            clearInterval(parsedMatch.loop);
            return;
        }
        const currentMatch: ServerMatch = JSON.parse(currentMatchJSON);

        // 2. Run physics
        moveServerPaddles(currentMatch.state, currentMatch.keys);
        moveBall(currentMatch.state, (scorer: Side) => {
            if (checkGameOver(currentMatch.state)) {
                const winner = currentMatch.state.score.left >= Rules.MAX_SCORE ? "left" : "right";
                // ✅ Pass the *current* match state to be persisted
                void persistAndEndGame(currentMatch, winner);
            } else {
                resetBall(currentMatch.state, scorer);
            }
        });

        // 3. Save the updated state back to Redis
        // 'void' tells TypeScript we don't want to wait for this
        void redis.hSet(REDIS_KEYS.MATCHES, gameId.toString(), JSON.stringify(currentMatch));

        // 4. Broadcast
        const stateMessage = JSON.stringify({ type: "state", state: currentMatch.state });
        currentMatch.players.left?.socket?.send(stateMessage);
        currentMatch.players.right?.socket?.send(stateMessage);

    }, 16); // ~60fps
}

/**
 * Creates a match in the database AND in Redis.
 */
async function createMatch(matchedPlayers: [Player, Player], mode: GameMode) {
    const [playerLeft, playerRight] = matchedPlayers;

    // 1. Create persistent game in SQL DB
    const playersData = [
        { user_id: playerLeft.id, position: 1 },
        { user_id: playerRight.id, position: 2 }
    ];
    let gameId: number;
    try {
        gameId = await gameRepository.createGameAndAddPlayers(mode, playersData);
    } catch (err) { /* ... */ return; }

    // 2. Create the in-memory match for Redis
    const match: ServerMatch = {
        gameId: gameId,
        mode: mode,
        players: { left: playerLeft, right: playerRight },
        ready: { left: false, right: false },
        state: initState(),
        startTime: Date.now(),
        keys: { /* ... */ },
        loop: undefined,
    };
    // ✅ Save to Redis Hash
    await redis.hSet(REDIS_KEYS.MATCHES, gameId.toString(), JSON.stringify(match));

    // 3. Update players in Redis with their gameId
    playerLeft.gameId = gameId;
    playerRight.gameId = gameId;
    await redis.hSet(REDIS_KEYS.PLAYERS, playerLeft.id.toString(), JSON.stringify(playerLeft));
    await redis.hSet(REDIS_KEYS.PLAYERS, playerRight.id.toString(), JSON.stringify(playerRight));

    // 4. Send "matchFound" message (same as before)
    // ...
}

// --- Message Handlers (Now Async) ---

async function handleJoinGame(userId: number, data: ClientMessage & { type: "joinGame" }, socket: WebSocket) {
    const player: Player = { /* ... */ };

    // ✅ Save player to Redis Hash
    await redis.hSet(REDIS_KEYS.PLAYERS, userId.toString(), JSON.stringify(player));

    if (data.mode === "remote") {
        // ✅ Add user ID to Redis List
        await redis.lPush(REDIS_KEYS.QUEUE_REMOTE, userId.toString());

        // Check length
        const queueLength = await redis.lLen(REDIS_KEYS.QUEUE_REMOTE);

        if (queueLength >= 2) {
            // ✅ Pop two user IDs from the list
            const p1_id_str = await redis.lPop(REDIS_KEYS.QUEUE_REMOTE);
            const p2_id_str = await redis.lPop(REDIS_KEYS.QUEUE_REMOTE);

            if (p1_id_str && p2_id_str) {
                // ✅ Get the full player data from Redis
                const p1_json = await redis.hGet(REDIS_KEYS.PLAYERS, p1_id_str);
                const p2_json = await redis.hGet(REDIS_KEYS.PLAYERS, p2_id_str);

                if (p1_json && p2_json) {
                    void createMatch([JSON.parse(p1_json), JSON.parse(p2_json)], "remote");
                }
            }
        }
    }
}

async function handleReady(userId: number) {
    const match = await getPlayerMatch(userId); // ✅ Now async
    const player = JSON.parse(await redis.hGet(REDIS_KEYS.PLAYERS, userId.toString())); // ✅ Now async
    if (!match || !player) return;

    const side = getPlayerSide(userId, match);
    if (!side) return;

    match.ready[side] = true;

    // ✅ Save updated match back to Redis
    await redis.hSet(REDIS_KEYS.MATCHES, match.gameId.toString(), JSON.stringify(match));

    if (match.ready.left && match.ready.right) {
        gameRepository.startGame(match.gameId).then(() => {
            void startGameLoop(match.gameId); // ✅ void to not await
        });
    }
}

async function handleMove(userId: number, data: ClientMessage & { type: "move" }) {
    const match = await getPlayerMatch(userId); // ✅ Now async
    if (!match) return;
    const side = getPlayerSide(userId, match);
    if (!side) return;

    match.keys[side].up = data.up ?? false;
    match.keys[side].down = data.down ?? false;

    // ✅ Save the updated key state back to Redis
    await redis.hSet(REDIS_KEYS.MATCHES, match.gameId.toString(), JSON.stringify(match));
}

async function handleLeaveGame(userId: number) {
    const playerJSON = await redis.hGet(REDIS_KEYS.PLAYERS, userId.toString());
    if (!playerJSON) return;
    const player: Player = JSON.parse(playerJSON);

    const match = await getPlayerMatch(userId); // ✅ Now async
    if (match) {
        if (match.loop) clearInterval(match.loop);

        const otherPlayer = match.players.left?.id === userId ? match.players.right : match.players.left;
        otherPlayer?.socket?.send(JSON.stringify({ type: "leaveGame" }));

        void gameRepository.cancelGame(match.gameId);

        // ✅ Remove from Redis
        await redis.hDel(REDIS_KEYS.MATCHES, match.gameId.toString());
    }

    // ✅ Remove from Redis List (Queue)
    // lRem finds and removes all instances of 'userId' from the list
    await redis.lRem(REDIS_KEYS.QUEUE_REMOTE, 0, userId.toString());

    player.gameId = undefined;
    player.mode = undefined;
    // ✅ Save updated player (without gameId) back to Redis
    await redis.hSet(REDIS_KEYS.PLAYERS, userId.toString(), JSON.stringify(player));
}

async function handlePlayAgain(userId: number, mode: GameMode) {
    const playerJSON = await redis.hGet(REDIS_KEYS.PLAYERS, userId.toString());
    if (!playerJSON) return;
    const player: Player = JSON.parse(playerJSON);

    await handleLeaveGame(userId); // ✅ Now async

    // ✅ handleJoinGame is already async
    await handleJoinGame(userId, {
        type: "joinGame",
        username: player.username,
        avatar: player.avatar,
        mode: mode,
    }, player.socket!);
}

// --- Main Exported Functions (Now Async) ---

export async function handleMessage(userId: number, data: ClientMessage, socket: WebSocket) {
    if (data.type === "joinGame") {
        await handleJoinGame(userId, data, socket); // ✅ await
        return;
    }

    const playerJSON = await redis.hGet(REDIS_KEYS.PLAYERS, userId.toString()); // ✅ await
    if (!playerJSON) {
        socket.close(1008, "Player not registered");
        return;
    }

    const player: Player = JSON.parse(playerJSON);
    player.socket = socket; // Keep socket fresh (this won't be persisted unless saved)
    // Note: We don't need to save the socket to Redis, only player data
    // We update the 'players' map *in memory* on the server handling this socket
    players.set(userId, player); // This is a local in-memory map for socket routing

    switch (data.type) {
        case "ready": await handleReady(userId); break; // ✅ await
        case "move": await handleMove(userId, data); break; // ✅ await
        case "playAgain": await handlePlayAgain(userId, data.mode); break; // ✅ await
        case "leaveGame": await handleLeaveGame(userId); break; // ✅ await
    }
}

export async function removePlayer(userId: number) {
    await handleLeaveGame(userId); // ✅ await
    await redis.hDel(REDIS_KEYS.PLAYERS, userId.toString()); // ✅ Remove from Redis
    console.log(`Player ${userId} removed from server.`);
}
