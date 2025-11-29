import { WebSocket } from "ws";
import { matches } from "./state";
import { Match, Side } from "./types/types";

export function isOpen(socket: WebSocket | null): boolean {
    return !!socket && socket.readyState === WebSocket.OPEN;
}

export function send(socket: WebSocket | null, msg: any): void {
    if (isOpen(socket)) socket!.send(JSON.stringify(msg));
}

export function findMatchByPlayer(id: number): Match | undefined {
    // for (const match of matches.values()) {
    //     if (
    //         match.players.left?.id === id ||
    //         match.players.right?.id === id ||
    //     ) {
    //         return match;
    //     }
    // }
    return undefined;
}

export function getPlayerSide(match: Match, id: number): Side | undefined {
    // if (match.players.left?.id === id) return "left";
    // if (match.players.right?.id === id) return "right";
    return undefined;
}
