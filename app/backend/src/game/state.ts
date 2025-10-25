import { Match, Player, GameMode } from "./types/types";

export const matches = new Map<number, Match>();
export const clients = new Map<number, Player>();
export const queues: Map<GameMode, Player[]> = new Map([["remote", []], ["ai", []], ["tournament", []], ["multiplayer", []],]);
