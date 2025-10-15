import { WebSocket } from "ws";
import { clients, queues } from "./state";
import { processQueue } from "./queue";
import { findMatchByPlayer, getPlayerSide, isOpen, send } from "./utils";
import { endMatch, startGameLoop } from "./match";
import { movePaddle } from "./mechanics/movement";
import { Player, Side, ClientMessage, GameMode } from "./types/types";

export interface MatchmakerAPI {
    addPlayer: (id: number, username: string, avatar: string, mode: GameMode, socket: WebSocket | null) => void;
    removePlayer: (id: number) => void;
    handleMessage: (id: number, data: ClientMessage, socket?: WebSocket) => void;
}

function addPlayer(id: number, username: string, avatar: string, mode: GameMode, socket: WebSocket | null): void {
    const player: Player = { id, username, avatar, socket, mode };
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


function removePlayer(id: number): void {
    // Remove player from all queues
    for (const [mode, queue] of queues.entries()) {
        queues.set(mode, queue.filter((p) => p.id !== id));
    }

    // Find match containing this player
    const match = findMatchByPlayer(id);

    if (!match) {
        // No active match: cleanup client if disconnected
        const player = clients.get(id);
        if (player && !isOpen(player.socket)) {
            clients.delete(id);
        }
        return;
    }

    // Find which side this player is on
    const side = getPlayerSide(match, id);
    if (!side) return;

    // Find opponent side and handle game over
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

    // Cleanup disconnected player
    const player = match.players[side];
    if (player && (!player.socket || !isOpen(player.socket))) {
        clients.delete(player.id);
    }

    // End the match, passing winnerId (opponent if present, otherwise null)
    endMatch(match, winnerId);
}



function handleMessage(id: number, data: ClientMessage, socket?: WebSocket): void {
    console.log(data.type);
    if (data.type === "joinGame") {
        if (!data.username || !socket)
            return;
        addPlayer(id, data.username, data.avatar, data.mode, socket);
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

        const mode = data.mode || player.mode || "remote";
        addPlayer(player.id, player.username, player.avatar, mode, player.socket);
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

export const matchmaker: MatchmakerAPI = {
    addPlayer,
    removePlayer,
    handleMessage,
};
