import { WebSocket } from "ws";
import { launchBall } from "../utils/ballUtils";
import { gameRepository } from "../../repository/gameRepository";
import { initState } from "../utils/initState";
import { Player, Match, Side, ClientMessage, ServerMessage, GameMode, } from "../types/types";

import { movePaddle } from "../mechanics/movement";
import { shuffleQueue } from "../utils/shuffleQueue";
import { MAX_SCORE, GAME_WIDTH, GAME_HEIGHT, TICK_RATE } from "../constants";

export interface MatchmakerAPI {
    addPlayer: (id: number, username: string, mode: GameMode, socket: WebSocket | null) => void;
    removePlayer: (id: number) => void;
    handleMessage: (id: number, data: ClientMessage, socket?: WebSocket) => void;
}

/**
 * Module-scoped state
 */
const matches = new Map<number, Match>();
const clients = new Map<number, Player>();
const queues: Map<GameMode, Player[]> = new Map([["1v1", []], ["ai", []], ["tournament", []], ["4v4", []],]);

/**
 * Public API
 */
function addPlayer(id: number, username: string, mode: GameMode, socket: WebSocket | null): void {
    const player: Player = { id, username, socket, mode };
    clients.set(id, player);

    if (findMatchByPlayer(id)) return;
    if (isPlayerInAnyQueue(id)) return;
    if (!isOpen(socket)) return;

    if (!queues.has(mode)) queues.set(mode, []);

    const queue = queues.get(mode)!;
    queue.push(player);

    processQueue(mode);
}

function removePlayer(id: number): void {
    for (const [mode, queue] of queues.entries()) {
        queues.set(mode, queue.filter((p) => p.id !== id));
    }

    const match = findMatchByPlayer(id);
    if (!match) {
        const player = clients.get(id);
        if (player && !isOpen(player.socket)) {
            clients.delete(id);
        }
        return;
    }

    const side = getPlayerSide(match, id)!;
    const opponentSide: Side = side === "left" ? "right" : "left";
    const opponent = match.players[opponentSide];

    if (opponent && isOpen(opponent.socket)) {
        send(opponent.socket, {
            type: "gameOver",
            winner: opponentSide,
            score: match.state.score,
        });
    }

    const player = match.players[side];
    if (!player) return;

    if (!player.socket || !isOpen(player.socket)) {
        clients.delete(player.id);
    }

    if (opponent && !isOpen(opponent.socket)) {
        clients.delete(opponent.id);
    }

    endMatch(match.game_id);
}

function handleMessage(id: number, data: ClientMessage, socket?: WebSocket): void {
    if (data.type === "joinGame") {
        if (!data.username || !socket) return;
        addPlayer(id, data.username, data.mode, socket);
        return;
    }

    if (data.type === "leaveGame") {
        removePlayer(id);
        return;
    }

    if (data.type === "playAgain") {
        const player = clients.get(id);
        if (!player || !isOpen(player.socket)) return;

        const mode = data.mode || player.mode || "1v1";
        addPlayer(player.id, player.username, mode, player.socket);
        return;
    }

    if (data.type === "ready") {
        const match = findMatchByPlayer(id);
        if (match) {
            const side = getPlayerSide(match, id);
            if (side) {
                match.ready[side] = true;
                if (match.ready.left && match.ready.right) {
                    startGameLoop(match);
                }
            }
        }
        return;
    }

    if (data.type === "move") {
        const match = findMatchByPlayer(id);
        if (match) {
            const side = getPlayerSide(match, id);
            if (side) {
                movePaddle(match.state.paddles[side], data.up, data.down);
            }
        }
        return;
    }
}

/**
 * Queue processing
 */
function isPlayerInAnyQueue(id: number): boolean {
    for (const queue of queues.values()) {
        if (queue.some((p) => p.id === id)) return true;
    }
    return false;
}

function processQueue(mode: GameMode): void {
    const queue = queues.get(mode)!;
    queues.set(mode, queue.filter((p) => isOpen(p.socket)));

    switch (mode) {
        case "1v1":
            process1v1Queue();
            break;
        case "ai":
            processAIQueue();
            break;
        case "tournament":
            processTournamentQueue();
            break;
        case "4p":
            process4v4Queue();
            break;
    }
}

function process1v1Queue(): void {
    const queue = queues.get("1v1")!;
    shuffleQueue(queue);

    while (queue.length >= 2) {
        const left = queue.shift()!;
        const right = queue.shift()!;

        if (findMatchByPlayer(left.id) || findMatchByPlayer(right.id)) continue;
        createMatch("1v1", left, right);
    }
}

function process4v4Queue(): void {
    // NOTE: Preserved original behavior (uses "1v1" queue).
    const queue = queues.get("1v1")!;
    shuffleQueue(queue);

    while (queue.length >= 4) {
        const left = queue.shift()!;
        const right = queue.shift()!;

        if (findMatchByPlayer(left.id) || findMatchByPlayer(right.id)) continue;
        createMatch("4v4", left, right);
    }
}

function processAIQueue(): void {
    // TODO: preserve as-is
}

function processTournamentQueue(): void {
    // TODO: preserved original behavior: defer to 1v1 queue
    process1v1Queue();
}

/**
 * Match lifecycle
 */
async function createMatch(mode: GameMode, leftPlayer: Player, rightPlayer: Player): Promise<void> {
    // NOTE: Preserved original behavior with a fixed game_id = 1.
    const game_id = 1;

    const match: Match = {
        game_id,
        players: { left: leftPlayer, right: rightPlayer },
        state: initState(),
        ready: { left: false, right: false },
        startTime: Date.now(),
        mode,
    };

    console.log(
        `Match created: game_id=${game_id}, mode=${mode}, left=${leftPlayer.username}, right=${rightPlayer.username}`
    );

    matches.set(game_id, match);
    sendMatchFound(match);
}

function sendMatchFound(match: Match): void {
    const leftPlayer = match.players.left;
    const rightPlayer = match.players.right;

    if (!leftPlayer || !rightPlayer) return;

    const baseMessage = {
        id: match.game_id.toString(),
        type: "matchFound" as const,
        mode: match.mode,
        leftUsername: leftPlayer.username,
        rightUsername: rightPlayer.username,
    };

    if (leftPlayer.socket && isOpen(leftPlayer.socket)) {
        send(leftPlayer.socket, { ...baseMessage, side: "left" as const });
    }

    if (rightPlayer.socket && isOpen(rightPlayer.socket)) {
        send(rightPlayer.socket, { ...baseMessage, side: "right" as const });
    }
}

function startGameLoop(match: Match): void {
    gameRepository.updateGameStatus(match.game_id, "in-progress");
    match.loop = setInterval((): void => {
        updateGameState(match);
        sendGameState(match);
    }, TICK_RATE);
}

function updateGameState(match: Match): void {
    const state = match.state;
    const ball = state.ball;
    const left = state.paddles.left;
    const right = state.paddles.right;

    if (!left || !right) return;

    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Wall collisions
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > GAME_HEIGHT) {
        ball.speedY *= -1;
    }

    // Paddle collisions
    if (
        ball.x - ball.radius < left.x + left.width &&
        ball.y > left.y &&
        ball.y < left.y + left.height
    ) {
        ball.speedX *= -1;
        ball.x = left.x + left.width + ball.radius;
    }

    if (
        ball.x + ball.radius > right.x &&
        ball.y > right.y &&
        ball.y < right.y + right.height
    ) {
        ball.speedX *= -1;
        ball.x = right.x - ball.radius;
    }

    // Score update
    if (ball.x < 0) {
        state.score.right = (state.score.right ?? 0) + 1;
        gameRepository.updateScore(match.game_id, state.score.left ?? 0, state.score.right);
        launchBall(state, "right");
        checkGameOver(match, "right");
    } else if (ball.x > GAME_WIDTH) {
        state.score.left = (state.score.left ?? 0) + 1;
        gameRepository.updateScore(match.game_id, state.score.left, state.score.right ?? 0);
        launchBall(state, "left");
        checkGameOver(match, "left");
    }
}

function sendGameState(match: Match): void {
    const stateMessage = { type: "state", state: match.state } as const;

    const leftPlayer = match.players.left;
    if (leftPlayer?.socket && isOpen(leftPlayer.socket)) {
        send(leftPlayer.socket, stateMessage);
    }

    const rightPlayer = match.players.right;
    if (rightPlayer?.socket && isOpen(rightPlayer.socket)) {
        send(rightPlayer.socket, stateMessage);
    }
}

function checkGameOver(match: Match, scorer: Side): void {
    const scoreValue = match.state.score[scorer];
    if (scoreValue !== undefined && scoreValue >= MAX_SCORE) {
        const score = match.state.score;
        const gameOverMessage = { type: "gameOver", winner: scorer, score } as const;

        const leftPlayer = match.players.left;
        if (leftPlayer?.socket && isOpen(leftPlayer.socket)) {
            send(leftPlayer.socket, gameOverMessage);
        }

        const rightPlayer = match.players.right;
        if (rightPlayer?.socket && isOpen(rightPlayer.socket)) {
            send(rightPlayer.socket, gameOverMessage);
        }

        stopLoop(match);
        endMatch(match.game_id);
    }
}

function stopLoop(match: Match): void {
    if (match.loop) clearInterval(match.loop);
    match.loop = undefined;
}

function endMatch(game_id: number): void {
    const match = matches.get(game_id);
    if (!match) return;
    stopLoop(match);
    matches.delete(game_id);
    console.log("Match ended and removed:", game_id);
}

/**
 * Utilities
 */
function send(socket: WebSocket | null, msg: ServerMessage): void {
    if (isOpen(socket)) socket!.send(JSON.stringify(msg));
}

function isOpen(socket: WebSocket | null): boolean {
    return !!socket && socket.readyState === WebSocket.OPEN;
}

function findMatchByPlayer(id: number): Match | undefined {
    for (const match of matches.values()) {
        if (
            match.players.left?.id === id ||
            match.players.right?.id === id
        ) {
            return match;
        }
    }
    return undefined;
}

function getPlayerSide(match: Match, id: number): Side | undefined {
    if (match.players.left?.id === id) return "left";
    if (match.players.right?.id === id) return "right";
    if (match.players.top?.id === id) return "top";
    if (match.players.bottom?.id === id) return "bottom";
    return undefined;
}

export const matchmaker: MatchmakerAPI = {
    addPlayer,
    removePlayer,
    handleMessage,
};
