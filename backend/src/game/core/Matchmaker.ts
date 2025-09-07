import { WebSocket } from "ws";
import { launchBall } from "../utils/ballUtils";
import { Side, ClientMessage, ServerMessage, GameState } from "../types/types";
import { aiManager } from "./AIManager";
import { gameRepository } from "../../repository/gameRepository";

import {
    MAX_SCORE,
    GAME_WIDTH,
    GAME_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    BALL_RADIUS,
    BALL_SPEED_X,
    BALL_SPEED_Y,
    TICK_RATE,
} from "../constants";

import { Player, Match } from "./MatchTypes";
import { movePaddle } from "../mechanics/movement";
import { checkCollision } from "../mechanics/collision";
import { shuffleQueue } from "../utils/shuffleQueue";

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
                this.playGame();
            }
        }
        this.endMatch(match.game_id);
    }

    handleMessage(id: number, data: ClientMessage, socket?: WebSocket) {
        if (data.type === "ai") {
            const human = this.clients.get(id);
            if (!human || !this.isOpen(human.socket))
                return;

            const match = aiManager.createVsAIMatch(human, data.username, this.createInitialState);
            this.matches.set(Date.now(), match);
            this.sendMatchFound(match);
            match.state.status = "waiting";
            return;
        }
        //-------------------------------------------//
        if (data.type === "human") {
            if (!data.username || !socket)
                return;
            this.addPlayer(id, data.username, socket);
            return;
        }

        if (data.type === "playAgain") {
            const player = this.clients.get(id);
            if (!player || !this.isOpen(player.socket))
                return;
            const match = this.findMatchByPlayer(id);
            if (match) this.endMatch(match.game_id);
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

        if (data.type === "ready") {
            match.ready[side] = true;
            if (match.ready.left && match.ready.right && match.state.status === "waiting") {
                match.state.status = "playing";
                this.startGameLoop(match);
            }
            return;
        }

        if (data.type === "move" && match.state.status === "playing") {
            movePaddle(match.state.paddles[side], data.up, data.down);
            return;
        }
    }

    private async playGame() {
        this.queue = this.queue.filter(p => this.isOpen(p.socket));
        shuffleQueue(this.queue);

        while (this.queue.length >= 2) {
            const left = this.queue.shift()!;
            const right = this.queue.shift()!;

            const game_id = await gameRepository.createGame("remote_1v1", 2, "waiting");

            await gameRepository.addPlayerToGame(game_id, left.id, "A", "left");
            await gameRepository.addPlayerToGame(game_id, right.id, "B", "right");

            const match: Match = {
                game_id,
                players: { left, right },
                state: this.createInitialState(),
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

            if (match.aiSide && match.aiIntent)
                movePaddle(state.paddles[match.aiSide], match.aiIntent.up, match.aiIntent.down);

            state.ball.x += state.ball.speedX;
            state.ball.y += state.ball.speedY;

            if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > GAME_HEIGHT)
                state.ball.speedY *= -1;

            checkCollision(state);

            if (state.ball.x < 0) {
                state.score.right++;
                gameRepository.updateScore(match.game_id, state.score.left, state.score.right);
                this.checkGameOver(match, "right");
            } else if (state.ball.x > GAME_WIDTH) {
                state.score.left++;
                gameRepository.updateScore(match.game_id, state.score.left, state.score.right);
                this.checkGameOver(match, "left");
            }

            this.send(match.players.left.socket, { type: "state", state });
            this.send(match.players.right.socket, { type: "state", state });
        }, TICK_RATE);
    }

    private async checkGameOver(match: Match, scorer: Side) {
        if (match.state.score[scorer] >= MAX_SCORE) {
            const score = match.state.score;
            const winnerId = match.players[scorer].id;
            const loserSide = scorer === "left" ? "right" : "left";
            const loserId = match.players[loserSide].id;

            // Send game over to both clients
            this.send(match.players.left.socket, { type: "gameOver", winner: scorer, score });
            this.send(match.players.right.socket, { type: "gameOver", winner: scorer, score });

            // 1️⃣ Mark game finished in DB
            const duration = this.calculateMatchDuration(match); // implement this to track start time
            await gameRepository.finishGame(match.game_id, duration);

            // 2️⃣ Update game_players stats
            await gameRepository.updatePlayerStats(
                match.game_id,
                match.players.left.id,
                score.left,
                0, // goals_scored if you track them
                0, // goals_conceded if you track them
                0  // accuracy if you track it
            );
            await gameRepository.updatePlayerStats(
                match.game_id,
                match.players.right.id,
                score.right,
                0,
                0,
                0
            );

            // 3️⃣ Update user_stats
            await gameRepository.updateUserStatsAfterMatch(
                winnerId,
                true, // won
                score[scorer],
                duration
            );
            await gameRepository.updateUserStatsAfterMatch(
                loserId,
                false, // lost
                score[loserSide],
                duration
            );

            // Stop loop and clean up
            this.stopLoop(match);
            this.endMatch(match.game_id);
        } else {
            launchBall(match.state, scorer === "left" ? "right" : "left");
        }
    }

    private calculateMatchDuration(match: Match) {
        return Math.floor((Date.now() - (match.startTime || Date.now())) / 1000); // seconds
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
