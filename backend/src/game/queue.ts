import { queues } from "./state";
// import { createMatch } from "./match";
import { shuffleQueue } from "./utils/shuffleQueue";
import gameRepository from '../repository/gameRepository';
import { isOpen, send } from "./utils";
import { initState } from "./utils/initState";
import { Player, Match, Side, GameMode } from "./types/types";
import { matches } from "./state";


function getQueue(mode: GameMode): Player[] {
    const q = queues.get(mode);
    if (q) return q;
    const fresh: Player[] = [];
    queues.set(mode, fresh);
    return fresh;
}

function pruneClosed(mode: GameMode): void {
    const q = getQueue(mode);
    const filtered = q.filter((p) => isOpen(p.socket));
    if (filtered.length !== q.length) queues.set(mode, filtered);
}

export function processQueue(mode: GameMode): void {
    pruneClosed(mode);

    switch (mode) {
        case "remote":
            process1v1Queue();
            break;
        case "multiplayer":
            process4pQueue();
            break;
        case "tournament":
            processTournamentQueue();
            break;
        case "ai":
            processAIQueue();
            break;
    }
}

export async function process1v1Queue(): Promise<void> {
    const queue = getQueue("remote");
    shuffleQueue(queue);

    while (queue.length >= 2) {
        const leftPlayer = queue.shift()!;
        const rightPlayer = queue.shift()!;

        const gameId = await gameRepository.createGame("remote");

        await gameRepository.addPlayerToGame(gameId, leftPlayer.id, 1);
        await gameRepository.addPlayerToGame(gameId, rightPlayer.id, 2);
        await gameRepository.startGame(gameId);

        const playerNames = {
            left: leftPlayer.username,
            right: rightPlayer.username,
        };

        const playerAvatars = {
            left: leftPlayer.avatar,
            right: rightPlayer.avatar,
        };

        const match: Match = {
            gameId,
            players: { left: leftPlayer, right: rightPlayer },
            ready: { left: false, right: false },
            state: initState("remote"),
            startTime: Date.now(),
            mode: "remote",
        };

        matches.set(gameId, match);
        send(leftPlayer.socket, { id: String(gameId), type: "matchFound", mode: "remote", side: "left", playerNames, playerAvatars, });
        send(rightPlayer.socket, { id: String(gameId), type: "matchFound", mode: "remote", side: "right", playerNames, playerAvatars, });
    }
}

export async function process4pQueue(): Promise<void> {
    const queue = getQueue("multiplayer");
    shuffleQueue(queue);

    while (queue.length >= 4) {
        const leftPlayer = queue.shift()!;
        const rightPlayer = queue.shift()!;
        const topPlayer = queue.shift()!;
        const bottomPlayer = queue.shift()!;

        const gameId = await gameRepository.createGame("multiplayer");

        await gameRepository.addPlayerToGame(gameId, leftPlayer.id, 1);
        await gameRepository.addPlayerToGame(gameId, rightPlayer.id, 2);
        await gameRepository.addPlayerToGame(gameId, topPlayer.id, 3);
        await gameRepository.addPlayerToGame(gameId, bottomPlayer.id, 4);

        const playerNames = {
            left: leftPlayer.username,
            right: rightPlayer.username,
            top: topPlayer.username,
            bottom: bottomPlayer.username,
        };

        const playerAvatars = {
            left: leftPlayer.avatar,
            right: rightPlayer.avatar,
            top: topPlayer.avatar,
            bottom: bottomPlayer.avatar,
        };

        const match: Match = {
            gameId,
            players: { left: leftPlayer, right: rightPlayer, top: topPlayer, bottom: bottomPlayer, },
            ready: { left: false, right: false, top: false, bottom: false },
            state: initState("multiplayer"),
            startTime: Date.now(),
            mode: "multiplayer",
        };

        matches.set(gameId, match);
        send(leftPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "left", playerNames, playerAvatars });
        send(rightPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "right", playerNames, playerAvatars });
        send(topPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "top", playerNames, playerAvatars });
        send(bottomPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "bottom", playerNames, playerAvatars });
    }
}

export function processAIQueue(): void {
    // TODO: implement
}

export function processTournamentQueue(): void {
    const queue = getQueue("tournament");
    shuffleQueue(queue);

    while (queue.length >= 2) {
        const players = { left: queue.shift()!, right: queue.shift()! };
        // safeCreateMatch("tournament", players);
    }
}
