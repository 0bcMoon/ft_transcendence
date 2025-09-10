import { WebSocket } from "ws";
import { launchBall } from "../utils/ballUtils";
import { gameRepository } from "../../repository/gameRepository";
import { initState } from "../utils/initState";
import { Player, Match, Side, ClientMessage, ServerMessage } from "../types/types";
import { movePaddle } from "../mechanics/movement";
import { shuffleQueue } from "../utils/shuffleQueue";

import { MAX_SCORE, GAME_WIDTH, GAME_HEIGHT, TICK_RATE, } from "../constants";


export class Matchmaker {
    private matches = new Map<number, Match>();
    private clients = new Map<number, Player>();
    private queue: Player[] = [];

    addPlayer(id: number, username: string, socket: WebSocket | null) {
        const player: Player = { id, username, socket };
        this.clients.set(id, player);
        if (this.findMatchByPlayer(id))
            return;
        if (this.queue.some(p => p.id === id))
            return;
        if (!this.isOpen(socket))
            return;
        this.queue.push(player);
        this.playGame();
    }

    removePlayer(id: number) {
        this.queue = this.queue.filter(p => p.id !== id);

        const match = this.findMatchByPlayer(id);
        if (!match) {
            const player = this.clients.get(id);
            if (player && !this.isOpen(player.socket))
                this.clients.delete(id);
            return;
        }

        const side = this.getPlayerSide(match, id)!;
        const opponentSide: Side = side === "left" ? "right" : "left";
        const opponent = match.players[opponentSide];

        if (opponent && this.isOpen(opponent.socket)) {
            this.send(opponent.socket, { type: "gameOver", winner: opponentSide, score: match.state.score });
        }

        const player = match.players[side];
        if (!this.isOpen(player.socket)) {
            this.clients.delete(player.id);
        }

        if (opponent && !this.isOpen(opponent.socket)) {
            this.clients.delete(opponent.id);
        }

        this.endMatch(match.game_id);
    }


    handleMessage(id: number, data: ClientMessage, socket?: WebSocket) {
        if (data.type === "1v1") {
            if (!data.username || !socket) return;
            this.addPlayer(id, data.username, socket);
            return;
        }

        if (data.type === "leaveGame") {
            this.removePlayer(id);
            return;
        }

        if (data.type === "playAgain") {
            const player = this.clients.get(id);
            if (!player || !this.isOpen(player.socket)) return;
            this.addPlayer(player.id, player.username, player.socket);
            return;
        }

        if (data.type === "play") {
            const match = this.findMatchByPlayer(id);
            if (match) {
                const side = this.getPlayerSide(match, id);
                if (side) {
                    match.ready[side] = true;
                    if (match.ready.left && match.ready.right)
                        this.startGameLoop(match);
                }
            }
            return;
        }

        if (data.type === "move") {
            const match = this.findMatchByPlayer(id);
            if (match) {
                const side = this.getPlayerSide(match, id);
                if (side)
                    movePaddle(match.state.paddles[side], data.up, data.down);
            }
            return;
        }
    }



    private async playGame() {
        this.queue = this.queue.filter(p => this.isOpen(p.socket));
        shuffleQueue(this.queue);

        while (this.queue.length >= 2) {
            const left = this.queue.shift()!;
            const right = this.queue.shift()!;

            if (this.findMatchByPlayer(left.id) || this.findMatchByPlayer(right.id)) continue;

            const game_id = await gameRepository.createGame("remote_1v1", 2, "waiting");

            await gameRepository.addPlayerToGame(game_id, left.id, "A", "left");
            await gameRepository.addPlayerToGame(game_id, right.id, "B", "right");

            const match: Match = {
                game_id,
                players: { left, right },
                state: initState(),
                ready: { left: false, right: false },
                startTime: Date.now(),
            };
            console.log(`Match created: game_id=${game_id}, left=${left.username}, right=${right.username}`);
            this.matches.set(game_id, match);
            this.sendMatchFound(match);
        }
    }

    private sendMatchFound(match: Match) {
        this.send(match.players.left.socket, {
            id: match.game_id.toString(),
            type: "matchFound",
            side: "left",
            leftUsername: match.players.left.username,
            rightUsername: match.players.right.username,
        });

        this.send(match.players.right.socket, {
            id: match.game_id.toString(),
            type: "matchFound",
            side: "right",
            leftUsername: match.players.left.username,
            rightUsername: match.players.right.username,
        });
    }

    private startGameLoop(match: Match) {
        gameRepository.updateGameStatus(match.game_id, "in-progress");
        match.loop = setInterval(() => {
            const state = match.state;
            const ball = state.ball;
            const { left, right } = state.paddles;

            ball.x += ball.speedX;
            ball.y += ball.speedY;

            if (ball.y - ball.radius < 0 || ball.y + ball.radius > GAME_HEIGHT)
                ball.speedY *= -1;

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

            if (ball.x < 0) {
                state.score.right++;
                gameRepository.updateScore(match.game_id, state.score.left, state.score.right);
                launchBall(match.state, "right");
                this.checkGameOver(match, "right");
            }
            else if (state.ball.x > GAME_WIDTH) {
                state.score.left++;
                gameRepository.updateScore(match.game_id, state.score.left, state.score.right);
                launchBall(match.state, "left");
                this.checkGameOver(match, "left");
            }

            this.send(match.players.left.socket, { type: "state", state });
            this.send(match.players.right.socket, { type: "state", state });
        }, TICK_RATE);
    }

    private async checkGameOver(match: Match, scorer: Side) {
        if (match.state.score[scorer] >= MAX_SCORE) {
            const score = match.state.score;

            this.send(match.players.left.socket, { type: "gameOver", winner: scorer, score });
            this.send(match.players.right.socket, { type: "gameOver", winner: scorer, score });

            this.stopLoop(match);
            this.endMatch(match.game_id);
        }
    }


    private stopLoop(match: Match) {
        if (match.loop) clearInterval(match.loop);
        match.loop = undefined;
    }

    private endMatch(game_id: number) {
        const match = this.matches.get(game_id);
        if (!match) return;
        this.stopLoop(match);
        this.matches.delete(game_id);

        console.log("Match ended and removed:", game_id);
    }

    private send(socket: WebSocket | null, msg: ServerMessage) {
        if (this.isOpen(socket)) socket!.send(JSON.stringify(msg));
    }

    private isOpen(socket: WebSocket | null) {
        return !!socket && socket.readyState === WebSocket.OPEN;
    }

    private findMatchByPlayer(id: number) {
        for (const match of this.matches.values())
            if (match.players.left.id === id || match.players.right.id === id) return match;
        return undefined;
    }

    private getPlayerSide(match: Match, id: number): Side | undefined {
        if (match.players.left.id === id)
            return "left";
        if (match.players.right.id === id)
            return "right";
        return undefined;
    }
}

export const matchmaker = new Matchmaker();
