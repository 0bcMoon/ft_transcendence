import { queues } from "./state";
import { isOpen } from "./utils";
import { createMatch } from "./match";
import { shuffleQueue } from "./utils/shuffleQueue";
import { GameMode, Player } from "./types/types";

export function isPlayerInAnyQueue(id: number): boolean {
    for (const queue of queues.values()) {
        if (queue.some((p) => p.id === id)) return true;
    }
    return false;
}

export function processQueue(mode: GameMode): void {
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
            process4pQueue();
            break;
    }
}

export function process1v1Queue(): void {
    const queue = queues.get("1v1")!;
    shuffleQueue(queue);

    while (queue.length >= 2) {
        const players = {
            left: queue.shift()!,
            right: queue.shift()!,
        };
        createMatch("1v1", players);
    }
}

export function process4pQueue(): void {
    const queue = queues.get("4p")!;
    shuffleQueue(queue);

    while (queue.length >= 4) {
        const players = {
            left: queue.shift()!,
            right: queue.shift()!,
            top: queue.shift()!,
            bottom: queue.shift()!
        };
        createMatch("4p", players);
    }
}

export function processAIQueue(): void {
    // TODO:
}

export function processTournamentQueue(): void {
    process1v1Queue();
}

function awaitable(p: Promise<void>): void {
    p.catch((err) => {
        // eslint-disable-next-line no-console
        console.error("createMatch failed:", err);
    });
}
