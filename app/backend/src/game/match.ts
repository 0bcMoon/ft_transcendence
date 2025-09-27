import { launchBall } from "./utils/ballUtils";
import { initState } from "./utils/initState";
import { matches } from "./state";
import { isOpen, send } from "./utils";
import { Player, Match, Side } from "./types/types";
import { MAX_SCORE, GAME_WIDTH, GAME_HEIGHT, TICK_RATE } from "./constants";

export async function createMatch(mode: Match["mode"], players: Partial<Record<Side, Player>>): Promise<void> {
    const game_id = Date.now();

    const ready: Partial<Record<Side, boolean>> = {};
    Object.keys(players).forEach((side) => {
        ready[side as Side] = false;
    });

    const match: Match = {
        game_id,
        players,
        state: initState(mode, players),
        ready,
        startTime: Date.now(),
        mode,
    };

    matches.set(game_id, match);
    sendMatchFound(match);
}

export function sendMatchFound(match: Match): void {
    const playerNames: Partial<Record<Side, string>> = {};
    const playerAvatars: Partial<Record<Side, string>> = {};

    for (const side of Object.keys(match.players) as Side[]) {
        const player = match.players[side];
        if (player) {
            playerNames[side] = player.username;
            playerAvatars[side] = player.avatar ?? "";
        }
    }

    for (const side of Object.keys(match.players) as Side[]) {
        const player = match.players[side];
        if (player?.socket && isOpen(player.socket)) {
            send(player.socket, {
                id: match.game_id.toString(),
                type: "matchFound" as const,
                mode: match.mode,
                side,
                playerNames,
                playerAvatars,
            });
        }
    }
}

export function startGameLoop(match: Match): void {
    match.loop = setInterval((): void => {
        updateGameState(match);
        sendGameState(match);
    }, TICK_RATE);
}

export function updateGameState(match: Match): void {
    const state = match.state;
    const ball = state.ball;
    const paddles = state.paddles;

    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Paddle collision (all sides, dynamic)
    for (const [side, paddle] of Object.entries(paddles)) {
        if (!paddle) continue;
        if (side === "left") {
            if (
                ball.x - ball.radius < paddle.x + paddle.width &&
                ball.y > paddle.y &&
                ball.y < paddle.y + paddle.height
            ) {
                ball.speedX = Math.abs(ball.speedX);
                ball.x = paddle.x + paddle.width + ball.radius;
            }
        } else if (side === "right") {
            if (
                ball.x + ball.radius > paddle.x &&
                ball.y > paddle.y &&
                ball.y < paddle.y + paddle.height
            ) {
                ball.speedX = -Math.abs(ball.speedX);
                ball.x = paddle.x - ball.radius;
            }
        } else if (side === "top") {
            if (
                ball.y - ball.radius < paddle.y + paddle.height &&
                ball.x > paddle.x &&
                ball.x < paddle.x + paddle.width
            ) {
                ball.speedY = Math.abs(ball.speedY);
                ball.y = paddle.y + paddle.height + ball.radius;
            }
        } else if (side === "bottom") {
            if (
                ball.y + ball.radius > paddle.y &&
                ball.x > paddle.x &&
                ball.x < paddle.x + paddle.width
            ) {
                ball.speedY = -Math.abs(ball.speedY);
                ball.y = paddle.y - ball.radius;
            }
        }
    }

    // Left wall
    if (ball.x - ball.radius < 0) {
        // If left paddle exists, this is scorable, not bouncy
        if (paddles.left) {
            state.score.right = (state.score.right ?? 0) + 1;
            launchBall(state, "right");
            checkGameOver(match, "right");
            return;
        } else {
            // No left paddle, bounce
            ball.x = ball.radius;
            ball.speedX *= -1;
        }
    }
    // Right wall
    else if (ball.x + ball.radius > GAME_WIDTH) {
        if (paddles.right) {
            state.score.left = (state.score.left ?? 0) + 1;
            launchBall(state, "left");
            checkGameOver(match, "left");
            return;
        } else {
            ball.x = GAME_WIDTH - ball.radius;
            ball.speedX *= -1;
        }
    }
    // Top wall
    else if (ball.y - ball.radius < 0) {
        if (paddles.top) {
            state.score.bottom = (state.score.bottom ?? 0) + 1;
            launchBall(state, "bottom");
            checkGameOver(match, "bottom");
            return;
        } else {
            ball.y = ball.radius;
            ball.speedY *= -1;
        }
    }
    // Bottom wall
    else if (ball.y + ball.radius > GAME_HEIGHT) {
        if (paddles.bottom) {
            state.score.top = (state.score.top ?? 0) + 1;
            launchBall(state, "top");
            checkGameOver(match, "top");
            return;
        } else {
            ball.y = GAME_HEIGHT - ball.radius;
            ball.speedY *= -1;
        }
    }
}

export function sendGameState(match: Match): void {
    const msg = { type: "state", state: match.state } as const;

    for (const player of Object.values(match.players)) {
        if (player?.socket && isOpen(player.socket)) {
            send(player.socket, msg);
        }
    }
}


export function checkGameOver(match: Match, scorer: Side): void {
    const scoreValue = match.state.score[scorer];
    if (scoreValue === undefined || scoreValue < MAX_SCORE)
        return;

    const score = match.state.score;
    for (const player of Object.values(match.players)) {
        if (player?.socket && isOpen(player.socket)) {
            send(player.socket, { type: "gameOver", winner: scorer, score });
        }
    }

    stopLoop(match);
    endMatch(match.game_id);
}

export function stopLoop(match: Match): void {
    if (match.loop) clearInterval(match.loop);
    match.loop = undefined;
}

export function endMatch(game_id: number): void {
    const match = matches.get(game_id);
    if (!match)
        return;
    stopLoop(match);
    matches.delete(game_id);
    console.log("Match ended and removed:", game_id);
}
