import { launchBall } from "./utils/ballUtils";
import { initState } from "./utils/initState";
import { matches } from "./state";
import { isOpen, send } from "./utils";
import { Player, Match, Side, GameMode } from "./types/types";
import { MAX_SCORE, GAME_WIDTH, GAME_HEIGHT, TICK_RATE } from "./constants";
import gameRepository from "../repository/gameRepository"; // Import your DB repo
import tournamentRepository from "../repository/tournamentRepository"; // Import your DB repo


const SIDES: Side[] = ["left", "right", "top", "bottom"];


export function startGameLoop(match: Match): void {
    if (match.loop)
        clearInterval(match.loop);
    match.loop = setInterval(() => { updateGameState(match); sendGameState(match); }, TICK_RATE);
}

/* ---------- Physics and scoring ---------- */

export async function updateGameState(match: Match): Promise<void> {
    const state = match.state;
    const ball = state.ball;
    const paddles = state.paddles;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Paddle collisions
    for (const side of SIDES) {
        const paddle = paddles[side];
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

    // Wall collisions and scoring
    if (ball.x - ball.radius < 0) {
        if (paddles.left) {
            await handleScore(match, "right");
            return;
        } else {
            ball.x = ball.radius;
            ball.speedX *= -1;
        }
    } else if (ball.x + ball.radius > GAME_WIDTH) {
        if (paddles.right) {
            await handleScore(match, "left");
            return;
        } else {
            ball.x = GAME_WIDTH - ball.radius;
            ball.speedX *= -1;
        }
    } else if (ball.y - ball.radius < 0) {
        if (paddles.top) {
            await handleScore(match, "bottom");
            return;
        } else {
            ball.y = ball.radius;
            ball.speedY *= -1;
        }
    } else if (ball.y + ball.radius > GAME_HEIGHT) {
        if (paddles.bottom) {
            await handleScore(match, "top");
            return;
        } else {
            ball.y = GAME_HEIGHT - ball.radius;
            ball.speedY *= -1;
        }
    }
}

async function handleScore(match: Match, scorer: Side): Promise<void> {
    const state = match.state;
    state.score[scorer] = (state.score[scorer] ?? 0) + 1;
    const playerId = match.players[scorer]?.id;
    const newScore = state.score[scorer];

    if (playerId !== undefined && playerId !== null) {
        try {
            await gameRepository.updatePlayerScore(match.gameId, playerId, newScore);
        } catch (err) {
            console.error("Failed to update player score in DB:", err);
        }
    }
    launchBall(state, scorer);
    await checkGameOver(match, scorer);
}

export function sendGameState(match: Match): void {
    const msg = { type: "state", state: match.state } as const;
    for (const player of Object.values(match.players)) {
        if (player?.socket && isOpen(player.socket)) {
            send(player.socket, msg);
        }
    }
}

/**
 * Checks if game is over, broadcasts result, stores final winner/score in DB, and cleans up.
 */
export async function checkGameOver(match: Match, scorer: Side): Promise<void> {
    const value = match.state.score[scorer];
    if (value === undefined || value < MAX_SCORE)
        return;

    const score = match.state.score;

    // Notify all clients
    for (const player of Object.values(match.players)) {
        if (player?.socket && isOpen(player.socket)) {
            send(player.socket, { type: "gameOver", winner: scorer, score });
        }
    }


    // Store game as finished in DB
    try {
        await gameRepository.finishGame(match.gameId, match.players[scorer]?.id ?? null);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to finish game in DB:", err);
    }
    stopLoop(match);
    await endMatch(match, match.players[scorer]?.id ?? null);
}

export function stopLoop(match: Match): void {
    if (match.loop)
        clearInterval(match.loop);
    match.loop = undefined;
}

/**
 * End match - finish in DB, check tournament advancement, cleanup
 */
export async function endMatch(match: Match, winnerId: number | null): Promise<void> {
    // Stop game loop
    stopLoop(match);

    try {
        // Mark game as finished in DB
        await gameRepository.finishGame(match.gameId, winnerId);
        console.log(`✅ Game ${match.gameId} finished. Winner: ${winnerId}`);

        // 🏆 Check if this is a tournament game and auto-advance
        if (match.mode === 'tournament') {
            console.log(`🎯 Checking tournament advancement for game ${match.gameId}...`);

            try {
                await tournamentRepository.checkAndAdvanceRound(match.gameId);
            } catch (tournamentErr) {
                console.error(`❌ Tournament advancement failed for game ${match.gameId}:`, tournamentErr);
                // Don't throw - game is still finished even if tournament advance fails
            }
        }
    } catch (err) {
        console.error(`❌ Failed to finish game ${match.gameId}:`, err);
    }

    // Remove from in-memory matches map
    matches.delete(match.gameId);

    console.log(`🗑️ Match ${match.gameId} removed from memory`);
}
