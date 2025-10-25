import { Side } from "../types/types";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const MAX_SCORE = 5;

export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 80;
export const PADDLE_SPEED = 8;
export const PADDLE_OFFSET = 30;

export const BALL_RADIUS = 10;
export const BALL_SPEED_X = 4;
export const BALL_SPEED_Y = 4;

export const MAX_BOUNCE_ANGLE_DEG = 60;           // Max deflection angle off a paddle
export const BALL_SPEED_INCREMENT = 0.4;          // Speed-up after each paddle hit
export const BALL_SPEED_MAX = 11;                 // Cap overall ball speed
export const MIN_ABS_X_SPEED = 2.5;               // Avoid near-vertical shots after bounce

export const SERVE_ANGLE_MIN_DEG = 10;
export const SERVE_ANGLE_MAX_DEG = 25;

// Colors
export const BACKGROUND_COLOR = "#1e293b";
export const BALL_COLOR = "#f9fafb";
export const LINE_COLOR = "#94a3b8";
export const COUNTDOWN_CIRCLE_COLOR = "#1e293b";
export const COUNTDOWN_BORDER_COLOR = "#3b82f6";
export const COUNTDOWN_TEXT_COLOR = "#ec4899";
export const GAME_OVER_OVERLAY = "rgba(0,0,0,0.7)";
export const COUNTDOWN_OVERLAY = "rgba(30,41,59,0.8)";

// Fonts
export const SCORE_FONT = "32px Arial";
export const COUNTDOWN_FONT = "bold 64px Arial";

// Paddle colors
export const PADDLE_COLORS: Partial<Record<Side, string>> = {
    left: "#3b82f6",
    right: "#6366f1",
    top: "#ec4899",
    bottom: "#10b981",
};
