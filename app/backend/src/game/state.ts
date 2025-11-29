import { Match, Player, GameMode } from "./types/types";

const players = new Map<number, Player>(); // Map<userId, Player>
const matches = new Map<number, Match>();   // Map<gameId, Match>
const queue = new Map<GameMode, Player[]>(); // Map<GameMode, Player[]>
