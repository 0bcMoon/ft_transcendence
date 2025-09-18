import {
    GAME_WIDTH,
    GAME_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    BALL_RADIUS,
    BALL_SPEED_X,
    BALL_SPEED_Y
} from "../constants";
import { GameState, GameMode, Player } from "../types/types";

type PlayersMap = Record<string, Player>;

/**
 * Initializes game state for any mode and set of players.
 * @param mode GameMode ("1v1" | "4p" | etc)
 * @param players Object mapping sides to Player (e.g. { left, right } or { left, right, top, bottom })
 */
export function initState(mode: GameMode, players: PlayersMap): GameState {
    const paddles: any = {};
    const score: any = {};

    if (mode === "1v1") {
        paddles.left = {
            x: 30,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        paddles.right = {
            x: GAME_WIDTH - 40,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        score.left = 0;
        score.right = 0;
    }
    if (mode === "4p") {
        paddles.left = {
            x: 30,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        paddles.right = {
            x: GAME_WIDTH - 40,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
        };
        paddles.top = {
            x: GAME_WIDTH / 2 - PADDLE_HEIGHT / 2,
            y: 30,
            width: PADDLE_HEIGHT,
            height: PADDLE_WIDTH,
        };
        paddles.bottom = {
            x: GAME_WIDTH / 2 - PADDLE_HEIGHT / 2,
            y: GAME_HEIGHT - 40,
            width: PADDLE_HEIGHT,
            height: PADDLE_WIDTH,
        };
        score.left = 0;
        score.right = 0;
        score.top = 0;
        score.bottom = 0;
    }

    // You can extend for other modes here

    return {
        paddles,
        ball: {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            radius: BALL_RADIUS,
            speedX: BALL_SPEED_X,
            speedY: BALL_SPEED_Y,
        },
        score,
    };
}
