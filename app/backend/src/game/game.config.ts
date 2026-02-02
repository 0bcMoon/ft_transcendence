export const Canvas = {
    WIDTH: 1280,
    HEIGHT: 720,
};

export const Paddle = {
    WIDTH: 16,
    HEIGHT: 120,
    SPEED: 8,
    OFFSET: 40,
};

export const Ball = {
    RADIUS: 12,
    INITIAL_SPEED_X: 4,
    INITIAL_SPEED_Y: 4,
    SPEED_INCREMENT: 0.4,
    SPEED_MAX: 11,
    MIN_ABS_SPEED_X: 2.5,
};

export const Physics = {
    MAX_PADDLE_BOUNCE_ANGLE: 60,
    SERVE_ANGLE_RANGE: { min: 10, max: 25 },
};

export const XP_RULES = {
    WIN:  100,
    LOSS:  30,
    PER_POINT: 5,
    XP_PER_LEVEL: 1000,
};

export function calculateLevel(totalXP: number): number {
        return totalXP / XP_RULES.XP_PER_LEVEL;
}
