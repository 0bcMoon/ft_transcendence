import { WebSocket } from "ws";
import { AIController } from "../AIController";
import { launchBall } from "../utils/ballUtils";
import { Side, ClientMessage, ServerMessage, GameState } from "../types/types";
import { gameRepository } from "../../repository/gameRepository";
import { userRepository } from "../../repository/userRepository"; // you'll need a helper for this


const PRESETS = {
    hard: { reactionMs: 500, aimError: 4, deadzone: 4, centerBias: 0.3, powerupAggro: 0.5 }
};

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
    private clients = new Map<number, Player>();
    private queue: Player[] = [];
    private matches = new Map<string, Match>();

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
        this.palayGame();
    }

    removePlayer(id: number) {
        this.queue = this.queue.filter(p => p.id !== id);
        const match = this.findMatchByPlayer(id);
        if (!match)
            return;

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
                this.palayGame();
            }
        }
        this.endMatch(match.id);
    }

    handleMessage(id: number, data: ClientMessage, socket?: WebSocket) {
        if (data.type === "ai") {
            const human = this.clients.get(id);
            if (!human || !this.isOpen(human.socket))
                return;

            const botName = data.username;
            this.startVsAI(human, botName);
            return;
        }

        if (data.type === "human") {
            if (!data.username || !socket) return;
            this.addPlayer(id, data.username, socket);
            return;
        }

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


    private startVsAI(human: Player, botUsername: string) {
        const ai: Player = { id: Date.now(), username: botUsername, socket: null };
        const left = ai;
        const right = human;

        const match: Match = {
            id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            players: { left, right },
            state: this.createInitialState(),
            ready: { left: true, right: true },
            aiSide: left === ai ? "left" : "right",
            aiIntent: { up: false, down: false },
        };

        const controller = new AIController(
            () => match.state,
            (intent) => { match.aiIntent = intent; },
            match.aiSide!,
            PRESETS.hard,
        );
        match.aiController = controller;
        controller.start();

        this.matches.set(match.id, match);
        this.sendMatchFound(match);
        match.state.status = "waiting";
    }


    private palayGame() {
        this.queue = this.queue.filter(p => this.isOpen(p.socket));
        shuffleQueue(this.queue);

        while (this.queue.length >= 2) {
            const left = this.queue.shift()!;
            const right = this.queue.shift()!;
            console.log("leeeft = ", left);
            console.log("riight = ", left);
            if (this.findMatchByPlayer(left.id) || this.findMatchByPlayer(right.id))
                continue;

            const match: Match = {
                id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                players: { left, right },
                state: this.createInitialState(),
                ready: { left: false, right: false },
            };

            this.matches.set(match.id, match);
            this.sendMatchFound(match);
        }
    }

    private sendMatchFound(match: Match) {
        this.send(match.players.left.socket, {
            id: match.id,
            type: "matchFound",
            side: "left",
            leftUsername: match.players.left.username,
            rightUsername: match.players.right.username,
        });

        this.send(match.players.right.socket, {
            id: match.id,
            type: "matchFound",
            side: "right",
            leftUsername: match.players.left.username,
            rightUsername: match.players.right.username,
        });
    }

    private startGameLoop(match: Match) {
        match.loop = setInterval(() => {
            const state = match.state;

            if (match.aiSide && match.aiIntent)
                movePaddle(match.state.paddles[match.aiSide], match.aiIntent.up, match.aiIntent.down);

            state.ball.x += state.ball.speedX;
            state.ball.y += state.ball.speedY;

            if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > GAME_HEIGHT)
                state.ball.speedY *= -1;

            checkCollision(state);

            if (state.ball.x < 0) {
                state.score.right++;
                this.checkGameOver(match, "right");
            }
            else if (state.ball.x > GAME_WIDTH) {
                state.score.left++;
                this.checkGameOver(match, "left");
            }

            this.send(match.players.left.socket, { type: "state", state });
            this.send(match.players.right.socket, { type: "state", state });
        }, TICK_RATE);
    }

    private checkGameOver(match: Match, scorer: Side) {
        if (match.state.score[scorer] >= MAX_SCORE) {
            const score = match.state.score;

            this.send(match.players.left.socket, { type: "gameOver", winner: scorer, score });
            this.send(match.players.right.socket, { type: "gameOver", winner: scorer, score });

            this.stopLoop(match);
            this.endMatch(match.id);
        }
        else
            launchBall(match.state, scorer === "left" ? "right" : "left");
    }

    private stopLoop(match: Match) {
        if (match.loop)
            clearInterval(match.loop);
        match.loop = undefined;
    }

    private endMatch(id: string) {
        const match = this.matches.get(id);
        if (!match)
            return;
        this.stopLoop(match);
        this.matches.delete(id);
        console.log("Match ended and removed:", id);
    }

    private send(socket: WebSocket | null, msg: ServerMessage) {
        if (this.isOpen(socket))
            socket!.send(JSON.stringify(msg));
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
