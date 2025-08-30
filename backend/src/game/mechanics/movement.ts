import { GAME_HEIGHT } from "../constants";
import type { Side, GameState } from "../types/types";

export function movePaddle(paddle: GameState["paddles"][Side], up?: boolean, down?: boolean) {
    const speed = 8;
    const maxY = GAME_HEIGHT - paddle.height;
    if (up) paddle.y = Math.max(0, paddle.y - speed);
    if (down) paddle.y = Math.min(maxY, paddle.y + speed);
}
