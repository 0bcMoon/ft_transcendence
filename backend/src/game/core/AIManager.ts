import { Player, Match, GameState, Side } from "./MatchTypes";
import { AIController } from "../AIController";

const PRESETS = {
    hard: { reactionMs: 500, aimError: 3, deadzone: 2, centerBias: 0.3, powerupAggro: 1 }
};


export class AIManager {
    createVsAIMatch(human: Player, botUsername: string, createInitialState: () => GameState): Match {
        const ai: Player = { id: Date.now(), username: botUsername, socket: null };
        const left = ai;
        const right = human;

        const match: Match = {
            game_id: 1,
            players: { left, right },
            state: createInitialState(),
            ready: { left: true, right: true },
            aiSide: left === ai ? "left" : "right",
            aiIntent: { up: false, down: false },
            startTime: Date.now(),

        };

        const controller = new AIController(
            () => match.state,
            (intent) => { match.aiIntent = intent; },
            match.aiSide as Side,
            PRESETS.hard,
        );

        match.aiController = controller;
        controller.start();

        return match;
    }
}

export const aiManager = new AIManager();
