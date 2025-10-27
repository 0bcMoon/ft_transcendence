import { WebSocket } from "ws";
import { clients, queues } from "./state";
import { processQueue } from "./queue";
import { findMatchByPlayer, getPlayerSide, isOpen, send } from "./utils";
import { endMatch, startGameLoop } from "./match";
import { movePaddle } from "./mechanics/movement";
import { Player, Side, ClientMessage, GameMode } from "./types/types";

export interface MatchmakerAPI {
    addPlayer: (id: number, username: string, avatar: string, mode: GameMode, socket: WebSocket | null, gameId?: number) => void;
    removePlayer: (id: number) => void;
    handleMessage: (id: number, data: ClientMessage, socket?: WebSocket) => void;
}

function addPlayer(id: number, username: string, avatar: string, mode: GameMode, socket: WebSocket | null, gameId?: number): void {
    const player: Player = { id, username, avatar, socket, mode, gameId };
    clients.set(id, player);

    if (findMatchByPlayer(id))
        return;
    if (!isOpen(socket))
        return;

    if (!queues.has(mode))
        queues.set(mode, []);

    const queue = queues.get(mode)!;
    queue.push(player);

    processQueue(mode);
}

export function removePlayer(id: number): void {
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

    const side = getPlayerSide(match, id);
    if (!side) return;

    let winnerId: number | null = null;
    for (const [oppSide, oppPlayer] of Object.entries(match.players) as [Side, Player][]) {
        if (oppSide !== side && oppPlayer && isOpen(oppPlayer.socket)) {
            send(oppPlayer.socket, { type: "gameOver", winner: oppSide, score: match.state.score });
            winnerId = oppPlayer.id;
        }
        if (oppPlayer && !isOpen(oppPlayer.socket)) {
            clients.delete(oppPlayer.id);
        }
    }

    const player = match.players[side];
    if (player && (!player.socket || !isOpen(player.socket))) {
        clients.delete(player.id);
    }

    endMatch(match, winnerId);
}

export function handleMessage(id: number, data: ClientMessage, socket?: WebSocket): void {
    console.log(data.type);

    if (data.type === "joinGame") {
        if (!data.username || !socket)
            return;
        addPlayer(id, data.username, data.avatar, data.mode, socket, data.gameId);
        return;
    }

    if (data.type === "leaveGame") {
        removePlayer(id);
        return;
    }

    if (data.type === "playAgain") {
        const player = clients.get(id);
        if (!player || !isOpen(player.socket))
            return;
        addPlayer(player.id, player.username, player.avatar, data.mode, player.socket);
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
        if (!match)
            return;

        const side = getPlayerSide(match, id);
        if (!side)
            return;

        movePaddle(match.state.paddles[side], side, data.up, data.down, data.left, data.right);
        return;
    }
}
