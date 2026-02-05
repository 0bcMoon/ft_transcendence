export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const MAX_SCORE = 5

// Ball constants
export const BALL_RADIUS = 12;
export const BALL_SPEED_X = 4;
export const BALL_SPEED_Y = 4;
export const BALL_INCREMENT = 0.4;
export const BALL_SPEED_MAX = 11;
export const BALL_MIN_ABS_SPEED_X = 2.5;

// Paddle constants
export const PADDLE_WIDTH = 16;
export const PADDLE_HEIGHT = 120;
export const PADDLE_SPEED = 8;
export const PADDLE_OFFSET = 40;

// Physics
export const MAX_PADDLE_BOUNCE_ANGLE = 60;
export const SERVE_ANGLE_RANGE = { min: 10, max: 25 };

// XP rules
export const XP_WIN = 100;
export const XP_LOSS = 30;
export const XP_PER_POINT = 5;
export const XP_PER_LEVEL = 1000;

// Helper
export const calculateLevel = (totalXP: number) => totalXP / XP_PER_LEVEL;

