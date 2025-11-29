import { WebSocket } from 'ws';
import {
    ClientMessage, GameMode, Match, Player, Side, GameState,
    PlayerNames, PlayerAvatars, Scores
} from './game.types';
import { initState, moveBall, checkGameOver, resetBall } from './game.physics';
import { Rules, Paddle, Canvas } from './game.config';
import gameRepository from '../repository/gameRepository'; // Import your repository
import tournamentRepository from '../repository/tournamentRepository';

// --- Server-Side Types ---
interface ServerMatch extends Match {
    keys: {
        left: { up: boolean, down: boolean };
        right: { up: boolean, down: boolean };
    };
    loop?: NodeJS.Timeout;
}

// --- In-Memory State ---
const players = new Map<number, Player>(); // Map<userId, Player>
const matches = new Map<number, ServerMatch>(); // Map<gameId, ServerMatch>
const queue = new Map<GameMode, Player[]>(); // Matchmaking queue for 'remote'

// --- Helper Functions ---

function getPlayerMatch(userId: number): ServerMatch | undefined {
    const player = players.get(userId);
    return player?.gameId ? matches.get(player.gameId) : undefined;
}

function getPlayerSide(userId: number, match: ServerMatch): Side | null {
    if (match.players.left?.id === userId) return "left";
    if (match.players.right?.id === userId) return "right";
    return null;
}

function moveServerPaddles(state: GameState, keys: ServerMatch['keys']) {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    // Use 'leftPaddle' and 'rightPaddle' to match your GameState type
    if (state.leftPaddle) {
        if (keys.left.up) state.leftPaddle.y -= Paddle.SPEED;
        if (keys.left.down) state.leftPaddle.y += Paddle.SPEED;
        state.leftPaddle.y = clamp(state.leftPaddle.y, 0, Canvas.HEIGHT - Paddle.HEIGHT);
    }
    if (state.rightPaddle) {
        if (keys.right.up) state.rightPaddle.y -= Paddle.SPEED;
        if (keys.right.down) state.rightPaddle.y += Paddle.SPEED;
        state.rightPaddle.y = clamp(state.rightPaddle.y, 0, Canvas.HEIGHT - Paddle.HEIGHT);
    }
}

async function persistAndEndGame(match: ServerMatch, winner: Side) {
    if (match.loop) clearInterval(match.loop);

    const winnerId = (winner === "left" ? match.players.left?.id : match.players.right?.id) ?? null;

    try {
        await gameRepository.updatePlayerScoreByPosition(match.gameId, 1, match.state.score.left);
        await gameRepository.updatePlayerScoreByPosition(match.gameId, 2, match.state.score.right);
        await gameRepository.finishGame(match.gameId, winnerId);

        // If it's a tournament, check for round advancement
        if (match.mode === 'tournament') {
            // We don't await this, let it run in the background
            void tournamentRepository.checkAndAdvanceRound(match.gameId);
        }
    } catch (err) {
        console.error("Failed to persist game:", err);
    }

    const gameOverMessage = JSON.stringify({
        type: "gameOver",
        winner: winner,
        score: match.state.score
    });
    match.players.left?.socket?.send(gameOverMessage);
    match.players.right?.socket?.send(gameOverMessage);

    matches.delete(match.gameId);
}

function startGameLoop(gameId: number) {
    const match = matches.get(gameId);
    if (!match) return;

    match.loop = setInterval(() => {
        moveServerPaddles(match.state, match.keys);

        moveBall(match.state, (scorer: Side) => {
            if (checkGameOver(match.state)) {
                const winner = match.state.score.left >= Rules.MAX_SCORE ? "left" : "right";
                void persistAndEndGame(match, winner);
            } else {
                resetBall(match.state, scorer);
            }
        });

        const stateMessage = JSON.stringify({ type: "state", state: match.state });
        match.players.left?.socket?.send(stateMessage);
        match.players.right?.socket?.send(stateMessage);
    }, 16);
}

/**
 * Creates a 'remote' match (matchmaking).
 * This function is ONLY for 'remote' mode.
 */
async function createRemoteMatch(matchedPlayers: [Player, Player]) {
    const [playerLeft, playerRight] = matchedPlayers;
    let gameId: number;

    try {
        // 1. Create the game and players in the database
        gameId = await gameRepository.createGameAndAddPlayers('remote', [
            { user_id: playerLeft.id, position: 1 },
            { user_id: playerRight.id, position: 2 }
        ]);
    } catch (err) {
        console.error("Failed to create remote game in database:", err);
        return;
    }

    // 2. Create the in-memory match
    const match: ServerMatch = {
        gameId: gameId,
        mode: 'remote',
        players: { left: playerLeft, right: playerRight },
        ready: { left: false, right: false },
        state: initState(),
        startTime: Date.now(),
        keys: {
            left: { up: false, down: false },
            right: { up: false, down: false }
        },
    };
    matches.set(gameId, match);

    // 3. Update player objects with the new gameId
    playerLeft.gameId = gameId;
    playerRight.gameId = gameId;

    // 4. Send "matchFound" to both players
    const playerNames: PlayerNames = {
        left: playerLeft.username,
        right: playerRight.username,
    };
    const playerAvatars: PlayerAvatars = {
        left: playerLeft.avatar,
        right: playerRight.avatar,
    };

    playerLeft.socket?.send(JSON.stringify({
        type: "matchFound", side: "left", id: gameId.toString(),
        mode: 'remote', playerNames, playerAvatars,
    }));
    playerRight.socket?.send(JSON.stringify({
        type: "matchFound", side: "right", id: gameId.toString(),
        mode: 'remote', playerNames, playerAvatars,
    }));
}

/**
 * Handles a player joining a 'remote' (matchmaking) queue.
 */
function handleRemoteJoin(player: Player) {
    console.log(`Player ${player.username} joining 'remote' queue...`);
    if (!queue.has("remote")) queue.set("remote", []);
    const remoteQueue = queue.get("remote")!;

    remoteQueue.push(player);

    if (remoteQueue.length >= 2) {
        const player1 = remoteQueue.shift()!;
        const player2 = remoteQueue.shift()!;
        void createRemoteMatch([player1, player2]);
    }
}

/**
 * Handles a player joining a specific 'tournament' game.
 */
async function handleTournamentJoin(player: Player, gameId: number) {
    console.log(`Player ${player.username} joining tournament game ${gameId}...`);
    player.gameId = gameId;

    // 1. Find or create the in-memory match
    let match = matches.get(gameId);
    if (!match) {
        // This is the FIRST player to join this game, create the match in memory
        const dbGame = await gameRepository.getGameById(gameId);
        if (!dbGame || dbGame.mode !== 'tournament') {
            console.error(`Player ${player.id} tried to join non-existent/invalid tournament game ${gameId}`);
            player.socket?.close(1008, "Tournament game not found");
            return;
        }

        match = {
            gameId: gameId,
            mode: 'tournament',
            players: {}, // Players will be added as they connect
            ready: { left: false, right: false },
            state: initState(),
            startTime: Date.now(),
            keys: {
                left: { up: false, down: false },
                right: { up: false, down: false }
            },
        };
        matches.set(gameId, match);
    }

    // 2. Add this player to their slot ('left' or 'right')
    const gamePlayers = await gameRepository.getGamePlayers(gameId);
    const myDbInfo = gamePlayers.find(p => p.user_id === player.id);
    const side = myDbInfo?.position === 1 ? 'left' : 'right';
    match.players[side] = player;

    // 3. If BOTH players are now connected, send "matchFound"
    if (match.players.left && match.players.right &&
        match.players.left.socket && match.players.right.socket) {

        const playerNames: PlayerNames = {
            left: match.players.left.username,
            right: match.players.right.username,
        };
        const playerAvatars: PlayerAvatars = {
            left: match.players.left.avatar,
            right: match.players.right.avatar,
        };

        match.players.left.socket.send(JSON.stringify({
            type: "matchFound", side: "left", id: gameId.toString(),
            mode: 'tournament', playerNames, playerAvatars,
        }));
        match.players.right.socket.send(JSON.stringify({
            type: "matchFound", side: "right", id: gameId.toString(),
            mode: 'tournament', playerNames, playerAvatars,
        }));

        console.log(`Tournament match ${gameId} is ready for players.`);
    }
}

// --- Main Message Handlers ---

async function handleJoinGame(userId: number, data: ClientMessage & { type: "joinGame" }, socket: WebSocket) {
    const player: Player = {
        id: userId,
        username: data.username,
        avatar: data.avatar,
        socket: socket,
        mode: data.mode,
    };
    players.set(userId, player);

    if (data.mode === "remote") {
        handleRemoteJoin(player);
    } else if (data.mode === "tournament") {
        await handleTournamentJoin(player, data.gameId!);
    }
}

function handleReady(userId: number) {
    const match = getPlayerMatch(userId);
    const player = players.get(userId);
    if (!match || !player) return;

    const side = getPlayerSide(userId, match);
    if (!side) return;

    match.ready[side] = true;

    if (match.ready.left && match.ready.right) {
        // For 'remote' games, we update the DB status
        if (match.mode === 'remote') {
            gameRepository.startGame(match.gameId)
                .then(() => {
                    console.log(`Match ${match.gameId} starting loop!`);
                    startGameLoop(match.gameId);
                })
                .catch(err => console.error("Failed to start game:", err));
        } else {
            // 'tournament' games are already 'playing', just start the loop
            console.log(`Match ${match.gameId} starting loop!`);
            startGameLoop(match.gameId);
        }
    }
}

function handleMove(userId: number, data: ClientMessage & { type: "move" }) {
    const match = getPlayerMatch(userId);
    if (!match) return;
    const side = getPlayerSide(userId, match);
    if (!side) return;
    match.keys[side].up = data.up ?? false;
    match.keys[side].down = data.down ?? false;
}

function handleLeaveGame(userId: number): void {
    const player = players.get(userId);
    if (!player) return;

    const match = getPlayerMatch(userId);
    if (match) {
        if (match.loop) clearInterval(match.loop);

        const remainingPlayerSide: Side = match.players.left?.id === userId ? "right" : "left";
        const remainingPlayer = match.players[remainingPlayerSide];

        if (remainingPlayer && remainingPlayer.socket?.readyState === WebSocket.OPEN) {
            console.log(`Player ${userId} left. Player ${remainingPlayer.id} wins ${match.gameId} by forfeit.`);
            void persistAndEndGame(match, remainingPlayerSide);
        } else {
            console.log(`Both players disconnected from match ${match.gameId}. Cancelling.`);
            gameRepository.cancelGame(match.gameId).catch(err => {
                console.error("Failed to cancel game in DB:", err);
            });
            matches.delete(match.gameId);
        }
    }

    queue.forEach((q) => {
        const index = q.findIndex(p => p.id === userId);
        if (index > -1) q.splice(index, 1);
    });

    player.gameId = undefined;
    player.mode = undefined;
    console.log(`Cleaned up player ${userId}`);
}

function handlePlayAgain(userId: number, mode: GameMode) {
    const player = players.get(userId);
    if (!player) return;

    if (mode === 'tournament') {
        console.warn(`Player ${userId} tried to 'playAgain' in a tournament. Ignoring.`);
        return; // Not allowed in tournaments
    }

    handleLeaveGame(userId); // Clean up old match

    handleJoinGame(userId, { // Re-join 'remote' queue
        type: "joinGame",
        username: player.username,
        avatar: player.avatar,
        mode: 'remote', // Only 'remote' can be played again
    }, player.socket!);
}

// --- Main Exported Functions ---

export function handleMessage(userId: number, data: ClientMessage, socket: WebSocket): void {
    if (data.type === "joinGame") {
        void handleJoinGame(userId, data, socket); // Handle async
        return;
    }

    const player = players.get(userId);
    if (!player) {
        console.warn(`Message from unknown player: ${userId}. Type: ${data.type}`);
        socket.close(1008, "Player not registered");
        return;
    }
    player.socket = socket;

    switch (data.type) {
        case "ready": handleReady(userId); break;
        case "move": handleMove(userId, data); break;
        case "playAgain": handlePlayAgain(userId, data.mode); break;
        case "leaveGame": handleLeaveGame(userId); break;
        default:
            console.warn(`Unknown message type received: ${(data as any).type}`);
    }
}

export function removePlayer(userId: number): void {
    handleLeaveGame(userId);
    players.delete(userId);
    console.log(`Player ${userId} removed from server.`);
}
