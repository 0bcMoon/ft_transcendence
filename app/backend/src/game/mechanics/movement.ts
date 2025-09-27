import { GAME_WIDTH, GAME_HEIGHT } from "../constants";
import type { Side, GameState, Paddle } from "../types/types";


export function movePaddle(
    paddle: Paddle | undefined,
    side: "left" | "right" | "top" | "bottom",
    up?: boolean,
    down?: boolean,
    left?: boolean,
    right?: boolean
): void {
    if (!paddle) return;
    const speed = 8;

    if (side === "left" || side === "right") {
        const maxY = GAME_HEIGHT - paddle.height;
        if (up)
            paddle.y = Math.max(0, paddle.y - speed);
        if (down)
            paddle.y = Math.min(maxY, paddle.y + speed);
    }
    else if (side === "top" || side === "bottom") {
        const maxX = GAME_WIDTH - paddle.width;
        if (left)
            paddle.x = Math.max(0, paddle.x - speed);
        if (right)
            paddle.x = Math.min(maxX, paddle.x + speed);
    }
}
