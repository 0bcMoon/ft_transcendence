export const Canvas = {
    WIDTH: 800,
    HEIGHT: 600,
};

export const Rules = {
    MAX_SCORE: 5,
};

export const Paddle = {
    WIDTH: 10,
    HEIGHT: 80,
    SPEED: 8,
    OFFSET: 30,
};

export const Ball = {
    RADIUS: 10,
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
    BACKGROUND: "#111827",
    FOREGROUND: "#F9FAFB",
    LINES: "#374151",
    PADDLE_LEFT: "#60A5FA",
    PADDLE_RIGHT: "#818CF8",
    OVERLAY_COUNTDOWN: "rgba(17, 24, 39, 0.75)",
    OVERLAY_GAMEOVER: "rgba(17, 24, 39, 0.9)",
    COUNTDOWN_TEXT: "#E5E7EB",
    GAMEOVER_TEXT: "#F87171",
    BALL: "#F9FAFB",
};

export const Fonts = {
    SCORE: "bold 60px ui-sans-serif, system-ui, sans-serif",
    COUNTDOWN: "bold 140px ui-sans-serif, system-ui, sans-serif",
    GAMEOVER: "bold 72px ui-sans-serif, system-ui, sans-serif",
};
