import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import type { GameState, Side } from "./types/types";

/**
 * Human-like AI:
 * - Sees GameState at most once per reactionMs
 * - Predicts ball y at paddle x with wall bounces (no A*)
 * - Adds aim error and a deadzone to feel human and prevent jitter
 * - Optionally detours for power-ups if beneficial (heuristic)
 */
export class AIController {
    private timer?: NodeJS.Timeout;
    private lastSnapshot?: GameState;

    constructor(
        private getState: () => GameState,
        private updateIntent: (intent: { up: boolean; down: boolean }) => void,
        private side: Side,
        private config: {
            reactionMs?: number;   // how often AI "looks" at the world
            aimError?: number;     // random vertical error (px)
            deadzone?: number;     // stop moving if within this error (px)
            centerBias?: number;   // desire to drift toward center when ball is away (0..1)
            maxChaseDist?: number; // if predicted impact far from paddle center, chase more aggressively
            powerupAggro?: number; // 0..1: how likely to detour for good power-ups
        } = {}
    ) { }

    start() {
        this.stop();
        const tick = () => this.thinkSafe();
        this.timer = setInterval(tick, this.config.reactionMs ?? 1000);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = undefined;
    }

    private thinkSafe() {
        try { this.think(); } catch { /* avoid crashing loop on edge-case */ }
    }

    private think() {
        const s = this.getState();
        this.lastSnapshot = s;
        if (s.status !== "playing") return;

        const paddle = s.paddles[this.side];
        const center = paddle.y + paddle.height / 2;

        // 1) If power-ups exist and make sense, consider detour
        const puTarget = this.choosePowerupTarget(s);
        if (puTarget) {
            const up = center > puTarget + (this.config.deadzone ?? 6);
            const down = center < puTarget - (this.config.deadzone ?? 6);
            return this.updateIntent({ up, down });
        }

        // 2) Predict impact y at paddle x (with wall bounces)
        const predictedY = this.predictBallImpactY(s);

        // 3) Add aim error for human feel
        const aimError = this.config.aimError ?? 8;
        const targetY = predictedY + this.rand(-aimError, aimError);

        // 4) If ball is moving away, drift toward center
        const movingAway =
            (this.side === "left" && s.ball.speedX > 0) ||
            (this.side === "right" && s.ball.speedX < 0);

        const driftCenter = GAME_HEIGHT / 2;
        const centerBias = this.config.centerBias ?? 0.5;
        const finalTarget = movingAway
            ? this.lerp(targetY, driftCenter, centerBias)
            : targetY;

        // 5) Turn intents on/off like held keys
        const deadzone = this.config.deadzone ?? 6;
        const up = center > finalTarget + deadzone;
        const down = center < finalTarget - deadzone;
        this.updateIntent({ up, down });
    }

    // Predict y where ball will meet this paddle's x, reflecting on top/bottom walls.
    private predictBallImpactY(s: GameState): number {
        const ball = {
            x: s.ball.x,
            y: s.ball.y,
            vx: s.ball.speedX,
            vy: s.ball.speedY,
            r: s.ball.radius,
        };
        const px = this.side === "left" ? s.paddles.left.x : s.paddles.right.x;

        // If ball moving away, aim mid by default
        const movingAway =
            (this.side === "left" && ball.vx > 0) ||
            (this.side === "right" && ball.vx < 0);
        if (movingAway) return GAME_HEIGHT / 2;

        // Step until we cross paddle x or safety bounds
        let safety = 0;
        while ((this.side === "left" && ball.x > px) || (this.side === "right" && ball.x < px)) {
            ball.x += ball.vx;
            ball.y += ball.vy;

            // reflect on top/bottom walls
            if (ball.y - ball.r < 0 || ball.y + ball.r > GAME_HEIGHT) {
                ball.vy *= -1;
            }

            // Prevent infinite loops if something's off
            safety++;
            if (safety > 4 * GAME_WIDTH) break;
        }
        return this.clamp(ball.y, 0, GAME_HEIGHT);
    }

    // Heuristic: if power-ups exist and one is near a plausible path,
    // bias target to its y. Requires state.powerUps?: { x, y, type, active }[]
    private choosePowerupTarget(s: GameState): number | null {
        const aggro = this.config.powerupAggro ?? 0; // 0 disables this path
        if (!aggro) return null;

        const powerUps = (s as any).powerUps as
            | { x: number; y: number; type: string; active: boolean }[]
            | undefined;
        if (!powerUps || !powerUps.length) return null;

        // Prefer active/beneficial power-ups roughly on our side path
        const px = this.side === "left" ? s.paddles.left.x : s.paddles.right.x;
        const towardUs = this.side === "left" ? (x: number) => x < s.ball.x : (x: number) => x > s.ball.x;

        const candidates = powerUps
            .filter(p => p.active)
            .filter(p => towardUs(p.x))
            .sort((a, b) => Math.abs(a.x - px) - Math.abs(b.x - px));

        if (!candidates.length) return null;

        // Roll the dice with aggro setting to avoid robotic behavior
        if (Math.random() > aggro) return null;

        // Aim for the closest candidate in x; AI still respects deadzone
        return candidates[0].y;
    }

    private clamp(v: number, lo: number, hi: number) {
        return Math.max(lo, Math.min(hi, v));
    }
    private rand(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }
    private lerp(a: number, b: number, t: number) {
        return a + (b - a) * this.clamp(t, 0, 1);
    }
}
