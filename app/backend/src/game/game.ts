import { WebSocket } from 'ws';
import { ClientMessage, GameMode, Player, Side, GameState, Match } from './types/types'; // Adjust path
// import { initState, moveBall, checkGameOver, resetBall } from './physics'; // Adjust path
// import { Rules, Paddle, Canvas } from './gameConfig'; // Adjust path

// --- In-Memory State (Assumed to be in this file) ---
const players = new Map<number, Player>(); // Map<userId, Player>
const matches = new Map<number, Match>();   // Map<gameId, Match>
const queue = new Map<GameMode, Player[]>(); // Map<GameMode, Player[]>

// --- Helper Functions (Assumed to be in this file) ---
// (These are the functions we defined previously, like createMatch,
// getPlayerMatch, handleReady, handleMove, etc.)

// function getPlayerMatch(userId: number): Match | undefined { /* ... */ }
// function getPlayerSide(userId: number, match: Match): Side | null { /* ... */ }
// function createMatch(players: [Player, Player], mode: GameMode): void { /* ... */ }
function handleJoinGame(userId: number, data: ClientMessage & { type: "joinGame" }, socket: WebSocket): void { /* ... */ }
function handleReady(userId: number): void { /* ... */ }
function handleMove(userId: number, data: ClientMessage & { type: "move" }): void { /* ... */ }
function handlePlayAgain(userId: number, mode: GameMode): void { /* ... */ }
function handleLeaveGame(userId: number): void { /* ... */ }

// --- Main Exported Functions ---

/**
 * Main message router called by Fastify.
 * It trusts the authenticated 'userId' from the route, not from the message.
 *
 * @param userId The authenticated user ID from fastify.authenticate
 * @param data The parsed ClientMessage object
 * @param socket The client's WebSocket connection
 */
export function handleMessage(userId: number, data: ClientMessage, socket: WebSocket): void {

    // 1. Handle "joinGame" first.
    // This is the only message a player can send *before* being in the 'players' map.
    if (data.type === "joinGame") {
        // We trust 'userId' from the route, not 'data.id'
        handleJoinGame(userId, data, socket);
        return;
    }

    // 2. For all other messages, the player MUST exist.
    const player = players.get(userId);
    if (!player) {
        console.warn(`Message from unknown player: ${userId}. Type: ${data.type}`);
        socket.close(1008, "Player not registered");
        return;
    }

    // 3. Keep the player's socket reference fresh (in case of re-connection)
    player.socket = socket;

    // 4. Route the message to the correct handler
    switch (data.type) {
        case "ready":
            handleReady(userId);
            break;
        case "move":
            handleMove(userId, data);
            break;
        case "playAgain":
            handlePlayAgain(userId, data.mode);
            break;
        case "leaveGame":
            handleLeaveGame(userId);
            break;
        default:
            // This handles cases where 'data.type' is a value not in the switch
            console.warn(`Unknown message type received: ${(data as any).type}`);
    }
}

/**
 * Called by Fastify when a socket disconnects (on "close" or "error").
 * This cleans up the player and any match they were in.
 *
 * @param userId The authenticated user ID that disconnected
 */
export function removePlayer(userId: number): void {
    // Re-using handleLeaveGame logic is the cleanest way to
    // ensure the player is fully removed from matches, queues, and maps.
    handleLeaveGame(userId);
}
