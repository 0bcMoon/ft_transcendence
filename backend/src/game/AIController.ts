import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { qTable, getStateIndex } from "./qLearningPolicy";
import type { GameState, Side } from "./types/types";

export class AIController {
    private timer?: NodeJS.Timeout;
    private epsilon: number;
    private lastState?: number;
    private lastAction?: number;

    constructor(
        private getState: () => GameState,
        private updateIntent: (intent: { up: boolean; down: boolean }) => void,
        private side: Side,
        private config: {
            reactionMs?: number;   // default 1000ms for spec
            epsilon?: number;      // exploration rate
            alpha?: number;        // learning rate
            gamma?: number;        // discount factor
            deadzone?: number;     // px threshold to stop moving
            aimError?: number;     // px random offset for human feel
            powerupAggro?: number; // 0..1 chance to chase power-ups
            training?: boolean;    // enable live Q-updates
        } = {}
    ) {
        this.epsilon = config.epsilon ?? 0.1;
    }

    start() {
        this.stop();
        const period = this.config.reactionMs ?? 1000; // 1s default
        this.timer = setInterval(() => this.think(), period);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = undefined;
    }

    private think() {
        // 1) Single snapshot per tick
        const s = this.getState();
        if (s.status !== "playing") {
            this.updateIntent({ up: false, down: false });
            return;
        }

        const paddle = s.paddles[this.side];
        const center = paddle.y + paddle.height / 2;

        // 2) Optional power-up detour
        const puTarget = this.choosePowerupTarget(s);
        if (puTarget !== null) {
            return this.moveToward(center, puTarget);
        }

        // 3) Predict intercept Y from snapshot
        const predictedY = this.predictImpactY(s);

        // 4) Add human-like aim error
        const aimError = this.config.aimError ?? 8;
        const targetY = this.clamp(predictedY + this.rand(-aimError, aimError), 0, GAME_HEIGHT);

        // 5) Q-policy bias
        const stateIndex = getStateIndex(s.ball.y, center);
        const action = this.chooseAction(stateIndex);
        const bias = action === 1 ? -10 : action === 2 ? 10 : 0;
        const finalTarget = this.clamp(targetY + bias, 0, GAME_HEIGHT);

        // 6) Move toward target (simulated key presses)
        this.moveToward(center, finalTarget);

        // 7) Live Q-learning update
        if (this.config.training && this.lastState !== undefined && this.lastAction !== undefined) {
            const reward = this.getReward(s);
            this.updateQTable(this.lastState, this.lastAction, reward, stateIndex);
        }

        this.lastState = stateIndex;
        this.lastAction = action;
    }

    private moveToward(center: number, targetY: number) {
        const deadzone = this.config.deadzone ?? 6;
        const up = center > targetY + deadzone;
        const down = center < targetY - deadzone;
        this.updateIntent({ up, down });
    }

    private predictImpactY(s: GameState): number {
        const ball = { x: s.ball.x, y: s.ball.y, vx: s.ball.speedX, vy: s.ball.speedY, r: s.ball.radius };
        const px = this.side === "left" ? s.paddles.left.x : s.paddles.right.x;

        const movingAway = (this.side === "left" && ball.vx > 0) || (this.side === "right" && ball.vx < 0);
        if (movingAway) return GAME_HEIGHT / 2;

        let safety = 0;
        while ((this.side === "left" && ball.x > px) || (this.side === "right" && ball.x < px)) {
            ball.x += ball.vx;
            ball.y += ball.vy;
            if (ball.y - ball.r < 0 || ball.y + ball.r > GAME_HEIGHT) {
                ball.vy *= -1;
            }
            if (++safety > 4 * GAME_WIDTH) break;
        }
        return this.clamp(ball.y, 0, GAME_HEIGHT);
    }

    private choosePowerupTarget(s: GameState): number | null {
        const aggro = this.config.powerupAggro ?? 0;
        if (!aggro) return null;
        const powerUps = (s as any).powerUps as { x: number; y: number; active: boolean }[] | undefined;
        if (!powerUps?.length) return null;

        const px = this.side === "left" ? s.paddles.left.x : s.paddles.right.x;
        const towardUs = this.side === "left" ? (x: number) => x < s.ball.x : (x: number) => x > s.ball.x;
        const candidates = powerUps.filter(p => p.active && towardUs(p.x));
        if (!candidates.length || Math.random() > aggro) return null;

        return candidates.sort((a, b) => Math.abs(a.x - px) - Math.abs(b.x - px))[0].y;
    }

    private chooseAction(stateIndex: number): number {
        if (Math.random() < this.epsilon) return Math.floor(Math.random() * 3);
        const qValues = qTable[stateIndex];
        return qValues.indexOf(Math.max(...qValues));
    }

    private getReward(s: GameState): number {
        const paddle = s.paddles[this.side];
        const center = paddle.y + paddle.height / 2;
        const ballY = s.ball.y;
        const maxDist = Math.max(60, GAME_HEIGHT / 4);
        const dist = Math.abs(ballY - center);
        let reward = 1 - dist / maxDist;

        const me = this.side === "left" ? s.score.left : s.score.right;
        const opp = this.side === "left" ? s.score.right : s.score.left;
        if (me > opp) reward += 1;
        if (opp > me) reward -= 1;

        return reward;
    }

    private updateQTable(prevState: number, action: number, reward: number, nextState: number) {
        const alpha = this.config.alpha ?? 0.1;
        const gamma = this.config.gamma ?? 0.8;
        const oldQ = qTable[prevState][action];
        const maxNextQ = Math.max(...qTable[nextState]);
        qTable[prevState][action] = oldQ + alpha * (reward + gamma * maxNextQ - oldQ);
    }

    private clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
    private rand(min: number, max: number) { return Math.random() * (max - min) + min; }
}

