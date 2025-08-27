import { WebSocket } from "ws";
import { Side, ClientMessage, ServerMessage, GameState } from "./types/types";

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
    private queue: Player[] = [];
    private matches = new Map<string, Match>();
    private readonly MAX_SCORE = 5;

    addPlayer(id: string, username: string, socket: WebSocket) {
        if (this.findMatchByPlayer(id) || this.queue.find(p => p.id === id)) return;
        this.queue.push({ id, username, socket });
        this.tryMatch();
    }

    removePlayer(id: string) {
        this.queue = this.queue.filter(p => p.id !== id);
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
            this.queue.push(opponent);
        }

        this.endMatch(match.id);
    }

    handleMessage(id: string, data: ClientMessage) {
        const match = this.findMatchByPlayer(id);
        const side = match ? this.getPlayerSide(match, id) : undefined;
        if (!match || !side) return;

        if (data.type === "start") {
            match.ready[side] = true;
            if (match.ready.left && match.ready.right && match.state.status === "waiting") {
                match.state.status = "playing";
                this.startGameLoop(match);
            }
        }

        if (data.type === "move" && match.state.status === "playing") {
            this.movePaddle(match.state.paddles[side], data.up, data.down);
        }

        if (data.type === "playAgain") {
            const match = this.findMatchByPlayer(id);
            const side = match ? this.getPlayerSide(match, id) : undefined;
            if (!match || !side) return;

            const player = match.players[side];
            this.endMatch(match.id);

            this.addPlayer(player.id, player.username, player.socket); //  triggers tryMatch
        }

    }

    private tryMatch() {
        while (this.queue.length >= 2) {
            const left = this.queue.shift()!;
            const right = this.queue.shift()!;

            if (this.findMatchByPlayer(left.id) || this.findMatchByPlayer(right.id)) {
                continue;
            }

            const matchId = `match_${Date.now()}`;
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
        const TICK = 1000 / 60;
        match.loop = setInterval(() => {
            const state = match.state;
            state.ball.x += state.ball.speedX;
            state.ball.y += state.ball.speedY;

            if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > 600) {
                state.ball.speedY *= -1;
            }

            this.checkCollision(state);

            if (state.ball.x < 0) {
                state.score.right++;
                this.checkGameOver(match, "right");
            } else if (state.ball.x > 800) {
                state.score.left++;
                this.checkGameOver(match, "left");
            }

            this.send(match.players.left.socket, { type: "state", state });
            this.send(match.players.right.socket, { type: "state", state });
        }, TICK);
    }

    private checkCollision(state: GameState) {
        const { left, right } = state.paddles;
        const ball = state.ball;

        if (
            ball.x - ball.radius < left.x + left.width &&
            ball.y > left.y &&
            ball.y < left.y + left.height
        ) {
            ball.speedX *= -1;
            ball.x = left.x + left.width + ball.radius;
        }

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
        if (match.state.score[scorer] >= this.MAX_SCORE) {
            match.state.status = "ended";
            const score = { ...match.state.score };
            this.send(match.players.left.socket, { type: "gameOver", winner: scorer, score });
            this.send(match.players.right.socket, { type: "gameOver", winner: scorer, score });
            this.stopLoop(match);
        } else {
            this.resetBall(match.state, scorer);
        }
    }

    private resetBall(state: GameState, direction: Side) {
        state.ball.x = 400;
        state.ball.y = 300;
        state.ball.speedX = direction === "left" ? -3 : 3;
        state.ball.speedY = 3;
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
    }

    private movePaddle(paddle: GameState["paddles"][Side], up?: boolean, down?: boolean) {
        const speed = 8;
        const maxY = 600 - paddle.height;
        if (up) paddle.y = Math.max(0, paddle.y - speed);
        if (down) paddle.y = Math.min(maxY, paddle.y + speed);
    }

    private send(socket: WebSocket, msg: ServerMessage) {
        if (this.isOpen(socket)) socket.send(JSON.stringify(msg));
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
                left: { x: 30, y: 260, width: 10, height: 80 },
                right: { x: 760, y: 260, width: 10, height: 80 },
            },
            ball: { x: 400, y: 300, radius: 10, speedX: 4, speedY: 4 },
            score: { left: 0, right: 0 },
        };
    }
}

export const matchmaker = new Matchmaker();

