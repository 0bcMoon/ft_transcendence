import type { WebSocket } from "ws";
import type { Side, GameState } from "../types/types";
import { AIController } from "../AIController";

export interface Player {
    id: string;
    username: string;
    socket: WebSocket | null; // AI has null
}


export interface Match {
    id: string;
    players: Record<Side, Player>;
    state: GameState;
    loop?: NodeJS.Timeout;
    ready: Record<Side, boolean>;
    aiSide?: Side;
    aiIntent?: { up: boolean; down: boolean };
    aiController?: AIController;
}
