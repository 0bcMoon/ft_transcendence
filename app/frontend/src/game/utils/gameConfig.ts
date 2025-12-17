
export const Canvas = {
    WIDTH: 1280,
    HEIGHT: 720,
};

export const Rules = {
    MAX_SCORE: 5,
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

export const Colors = {
    BACKGROUND: "#020617",
    PADDLE_LEFT: "#3b82f6",
    PADDLE_RIGHT: "#ef4444",
    BALL: "#FFFFFF",
    LINES: "rgba(255, 255, 255, 0.15)",
    SCORE_TEXT: "rgba(255, 255, 255, 0.2)",
    COUNTDOWN_TEXT: "#FFFFFF",
};

export const Fonts = {
    SCORE: "bold 72px ui-monospace, monospace",
    COUNTDOWN: "bold 120px ui-sans-serif, system-ui, sans-serif",
    GAMEOVER: "bold 50px ui-sans-serif, system-ui, sans-serif",
};

export const Effects = {
    GLOW_BLUR: 25,
};
