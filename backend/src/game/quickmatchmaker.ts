import { WebSocket } from "ws";
import { Side, ClientMessage, ServerMessage, GameState } from "./types/types";
import {
    MAX_SCORE,
    GAME_WIDTH,
    GAME_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    BALL_RADIUS,
    BALL_SPEED_X,
    BALL_SPEED_Y,
    RESET_BALL_SPEED_X,
    RESET_BALL_SPEED_Y,
    TICK_RATE,
} from "./constants";

interface Player {
    id: string;
    username: string;
    socket: WebSocket;
}

interface Match {
    id: string;
    players: Record<Side, Player>;
    state: GameState;
    loop?: NodeJS.Timeout;
    ready: Record<Side, boolean>;
}

class Matchmaker {
    // Tracks latest socket/username per player so playAgain can always requeue
    private clients = new Map<string, Player>();
    private queue: Player[] = [];
    private matches = new Map<string, Match>();

    addPlayer(id: string, username: string, socket: WebSocket) {
        // Refresh registry with latest socket/username
        const player: Player = { id, username, socket };
        this.clients.set(id, player);

        // Skip if already in a match or already queued
        if (this.findMatchByPlayer(id)) return;
        if (this.queue.some(p => p.id === id)) return;

        // Only enqueue if socket is open
        if (!this.isOpen(socket)) return;

        this.queue.push(player);
        this.tryMatch();
    }

    removePlayer(id: string) {
        this.queue = this.queue.filter(p => p.id !== id);

        // If in a match, end it and requeue opponent if possible
        const match = this.findMatchByPlayer(id);
        if (!match) return;

        const side = this.getPlayerSide(match, id)!;
        const opponentSide: Side = side === "left" ? "right" : "left";
        const opponent = match.players[opponentSide];

        if (opponent && this.isOpen(opponent.socket)) {
            this.send(opponent.socket, {
                type: "gameOver",
                winner: opponentSide,
                score: { ...match.state.score },
            });

            if (!this.queue.some(p => p.id === opponent.id) && !this.findMatchByPlayer(opponent.id)) {
                this.queue.push(opponent);
                this.tryMatch();
            }
        }

        this.endMatch(match.id);
    }

    handleMessage(id: string, data: ClientMessage) {
        if (data.type === "playAgain") {
            const player = this.clients.get(id);
            if (!player || !this.isOpen(player.socket)) return;

            const match = this.findMatchByPlayer(id);
            if (match) this.endMatch(match.id);

            this.addPlayer(player.id, player.username, player.socket);

            return;
        }


        if (data.type === "leaveGame") {
            this.removePlayer(id);
            return;
        }

        const match = this.findMatchByPlayer(id);
        const side = match ? this.getPlayerSide(match, id) : undefined;
        if (!match || !side) return;

        if (data.type === "play") {
            match.ready[side] = true;
            if (match.ready.left && match.ready.right && match.state.status === "waiting") {
                match.state.status = "playing";
                this.startGameLoop(match);
            }
            return;
        }

        if (data.type === "move" && match.state.status === "playing") {
            this.movePaddle(match.state.paddles[side], data.up, data.down);
            return;
        }
    }

    private tryMatch() {
        // Clean queue of disconnected players
        this.queue = this.queue.filter(p => this.isOpen(p.socket));

        // Shuffle queue for randomness
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }

        // Keep creating matches while 2+ players in the queue
        while (this.queue.length >= 2) {
            const left = this.queue.shift()!;
            const right = this.queue.shift()!;

            // Defensive: skip if either somehow already matched
            if (this.findMatchByPlayer(left.id) || this.findMatchByPlayer(right.id)) continue;

            const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const match: Match = {
                id: matchId,
                players: { left, right },
                state: this.createInitialState(),
                ready: { left: false, right: false },
            };

            this.matches.set(matchId, match);
            this.sendMatchFound(match);
        }
    }


    private sendMatchFound(match: Match) {
        this.send(match.players.left.socket, {
            type: "matchFound",
            side: "left",
            leftUsername: match.players.left.username,
            rightUsername: match.players.right.username,
        });

        this.send(match.players.right.socket, {
            type: "matchFound",
            side: "right",
            leftUsername: match.players.left.username,
            rightUsername: match.players.right.username,
        });
    }

    private startGameLoop(match: Match) {
        match.loop = setInterval(() => {
            const state = match.state;

            // Ball movement
            state.ball.x += state.ball.speedX;
            state.ball.y += state.ball.speedY;

            // Top/bottom walls
            if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > GAME_HEIGHT) {
                state.ball.speedY *= -1;
            }

            // Paddles
            this.checkCollision(state);

            // Scoring
            if (state.ball.x < 0) {
                state.score.right++;
                this.checkGameOver(match, "right");
            } else if (state.ball.x > GAME_WIDTH) {
                state.score.left++;
                this.checkGameOver(match, "left");
            }

            // Broadcast
            this.send(match.players.left.socket, { type: "state", state });
            this.send(match.players.right.socket, { type: "state", state });
        }, TICK_RATE);
    }

    private checkCollision(state: GameState) {
        const { left, right } = state.paddles;
        const ball = state.ball;

        // Left paddle
        if (
            ball.x - ball.radius < left.x + left.width &&
            ball.y > left.y &&
            ball.y < left.y + left.height
        ) {
            ball.speedX *= -1;
            ball.x = left.x + left.width + ball.radius;
        }

        // Right paddle
        if (
            ball.x + ball.radius > right.x &&
            ball.y > right.y &&
            ball.y < right.y + right.height
        ) {
            ball.speedX *= -1;
            ball.x = right.x - ball.radius;
        }
    }

    private checkGameOver(match: Match, scorer: Side) {
        if (match.state.score[scorer] >= MAX_SCORE) {
            match.state.status = "ended";
            const score = { ...match.state.score };

            this.send(match.players.left.socket, { type: "gameOver", winner: scorer, score });
            this.send(match.players.right.socket, { type: "gameOver", winner: scorer, score });

            this.stopLoop(match);
            this.endMatch(match.id);
        } else {
            this.resetBall(match.state, scorer);
        }
    }

    private resetBall(state: GameState, direction: Side) {
        state.ball.x = GAME_WIDTH / 2;
        state.ball.y = GAME_HEIGHT / 2;
        state.ball.speedX = RESET_BALL_SPEED_X[direction];
        state.ball.speedY = RESET_BALL_SPEED_Y;
    }

    private stopLoop(match: Match) {
        if (match.loop) clearInterval(match.loop);
        match.loop = undefined;
    }

    private endMatch(id: string) {
        const match = this.matches.get(id);
        if (!match) return;
        this.stopLoop(match);
        this.matches.delete(id);
        console.log("Match ended and removed:", id);
    }

    private movePaddle(paddle: GameState["paddles"][Side], up?: boolean, down?: boolean) {
        const speed = 8;
        const maxY = GAME_HEIGHT - paddle.height;
        if (up) paddle.y = Math.max(0, paddle.y - speed);
        if (down) paddle.y = Math.min(maxY, paddle.y + speed);
    }

    private send(socket: WebSocket, msg: ServerMessage) {
        if (this.isOpen(socket)) {
            socket.send(JSON.stringify(msg));
        }
    }

    private isOpen(socket: WebSocket) {
        return socket.readyState === WebSocket.OPEN;
    }

    private findMatchByPlayer(id: string) {
        for (const match of this.matches.values()) {
            if (match.players.left.id === id || match.players.right.id === id) return match;
        }
        return undefined;
    }

    private getPlayerSide(match: Match, id: string): Side | undefined {
        if (match.players.left.id === id) return "left";
        if (match.players.right.id === id) return "right";
        return undefined;
    }

    private createInitialState(): GameState {
        return {
            status: "waiting",
            paddles: {
                left: {
                    x: 30,
                    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
                    width: PADDLE_WIDTH,
                    height: PADDLE_HEIGHT,
                },
                right: {
                    x: GAME_WIDTH - 40,
                    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
                    width: PADDLE_WIDTH,
                    height: PADDLE_HEIGHT,
                },
            },
            ball: {
                x: GAME_WIDTH / 2,
                y: GAME_HEIGHT / 2,
                radius: BALL_RADIUS,
                speedX: BALL_SPEED_X,
                speedY: BALL_SPEED_Y,
            },
            score: { left: 0, right: 0 },
        };
    }
}

export const matchmaker = new Matchmaker();

