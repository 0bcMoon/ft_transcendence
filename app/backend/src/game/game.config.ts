export const Canvas = {
    WIDTH: 800,
    HEIGHT: 600,
};

export const Rules = {
    MAX_SCORE: 5, // Score needed to win
};

export const Paddle = {
    WIDTH: 10,
    HEIGHT: 80,
    SPEED: 8, // Pixels per frame
    OFFSET: 30, // Distance from canvas edge
};

export const Ball = {
    RADIUS: 10,
    INITIAL_SPEED_X: 4,
    INITIAL_SPEED_Y: 4,
    SPEED_INCREMENT: 0.4, // Speed increase per paddle hit
    SPEED_MAX: 11, // Maximum speed cap
    MIN_ABS_SPEED_X: 2.5, // Minimum horizontal speed after bounce
};

export const Physics = {
    MAX_PADDLE_BOUNCE_ANGLE: 60,
    SERVE_ANGLE_RANGE: { min: 10, max: 25 },
};

export const Colors = {
    BACKGROUND: "#111827",         // Deep dark blue
    FOREGROUND: "#F9FAFB",         // Bright white/off-white (for ball, score)
    LINES: "#374151",              // Muted gray-blue
    PADDLE_LEFT: "#60A5FA",         // Light Blue
    PADDLE_RIGHT: "#818CF8",        // Indigo
    OVERLAY_COUNTDOWN: "rgba(17, 24, 39, 0.75)",
    OVERLAY_GAMEOVER: "rgba(17, 24, 39, 0.9)",
    COUNTDOWN_TEXT: "#E5E7EB",     // Light gray
    GAMEOVER_TEXT: "#F87171",      // Red
    BALL: "#F9FAFB",               // Explicitly define ball color
};

export const Fonts = {
    SCORE: "bold 60px ui-sans-serif, system-ui, sans-serif",
    COUNTDOWN: "bold 140px ui-sans-serif, system-ui, sans-serif",
    GAMEOVER: "bold 72px ui-sans-serif, system-ui, sans-serif",
};
