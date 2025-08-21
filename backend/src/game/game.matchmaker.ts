import { WebSocket } from "ws";
import { GameState, GameMessage } from "./game.protocol";

interface WaitingPlayer {
    userId: number;
    socket: WebSocket;
}

interface Match {
    player1: WaitingPlayer;
    player2: WaitingPlayer;
    state: GameState;
    roomId: string;
    started: boolean;
}

const MAX_SCORE = 10;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 12;
const COURT_WIDTH = 800;
const COURT_HEIGHT = 600;
const BALL_START_X = COURT_WIDTH / 2;
const BALL_START_Y = COURT_HEIGHT / 2;

class Matchmaker {
    private waiting: WaitingPlayer[] = [];
    private matches: Map<number, Match> = new Map();
    private gameLoops: Map<string, NodeJS.Timeout> = new Map();

    addPlayer(userId: number, socket: WebSocket): void {
        if (this.matches.has(userId)) return;
        if (this.waiting.some((p) => p.userId === userId)) return;

        const player: WaitingPlayer = { userId, socket };

        if (this.waiting.length > 0) {
            const opponent = this.waiting.shift()!;
            const roomId = this.makeRoomId(opponent.userId, player.userId);
            const match: Match = {
                player1: opponent,
                player2: player,
                state: this.createInitialGameState(),
                roomId,
                started: true,
            };
            this.matches.set(opponent.userId, match);
            this.matches.set(player.userId, match);

            // Inform both players
            this.send(opponent.socket, {
                type: "game_start",
                playerId: 1,
                roomId,
                data: {
                    playerNumber: 1,
                    roomId,
                    gameState: match.state,
                },
            });
            this.send(player.socket, {
                type: "game_start",
                playerId: 2,
                roomId,
                data: {
                    playerNumber: 2,
                    roomId,
                    gameState: match.state,
                },
            });

            // Start game loop after both clients have received game_start
            setTimeout(() => this.startGameLoop(match), 100);
        } else {
            this.waiting.push(player);
            this.send(socket, { type: "waiting" });
        }
    }

    removePlayer(userId: number): void {
        this.waiting = this.waiting.filter((p) => p.userId !== userId);
        const match = this.matches.get(userId);
        if (!match || !match.started) return;

        this.matches.delete(match.player1.userId);
        this.matches.delete(match.player2.userId);
        clearInterval(this.gameLoops.get(match.roomId));
        this.gameLoops.delete(match.roomId);

        // Inform the other player and close socket
        const isPlayer1 = match.player1.userId === userId;
        const otherPlayer = isPlayer1 ? match.player2 : match.player1;
        const winner = isPlayer1 ? 2 : 1;
        this.send(otherPlayer.socket, {
            type: "game_over",
            roomId: match.roomId,
            data: {
                winner,
                finalScore: {
                    player1: match.state.score1,
                    player2: match.state.score2,
                },
            },
        });
        setTimeout(() => {
            otherPlayer.socket.close();
        }, 500);
    }

    handleMessage(userId: number, raw: string): void {
        const match = this.matches.get(userId);
        if (!match || !match.started) return;

        let msg;
        try {
            msg = JSON.parse(raw);
        } catch {
            return;
        }

        // Fixed: Check for the correct message structure
        if (
            msg.type === "paddle_move" &&
            msg.data &&
            typeof msg.data.y === "number"
        ) {
            const paddleMin = 0;
            const paddleMax = COURT_HEIGHT - PADDLE_HEIGHT;
            const y = Math.max(paddleMin, Math.min(paddleMax, msg.data.y));

            // Determine which player this is
            const isPlayer1 = match.player1.userId === userId;

            // Update the correct paddle position
            if (isPlayer1) {
                match.state.paddle1Y = y;
            } else {
                match.state.paddle2Y = y;
            }

            // Optional: Broadcast immediate state update for smoother gameplay
            this.broadcastGameState(match);
        }
    }

    private broadcastGameState(match: Match): void {
        const message = {
            type: "game_state",
            roomId: match.roomId,
            data: match.state,
        };
        this.send(match.player1.socket, message);
        this.send(match.player2.socket, message);
    }

    private send(socket: WebSocket, msg: any): void {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
        }
    }

    private makeRoomId(id1: number, id2: number): string {
        return [id1, id2].sort().join("-");
    }

    private createInitialGameState(): GameState {
        return {
            ballX: BALL_START_X,
            ballY: BALL_START_Y,
            ballVelX: Math.random() > 0.2 ? 2 : -1,
            ballVelY: Math.random() > 0.2 ? 1 : -2,
            paddle1Y: (COURT_HEIGHT - PADDLE_HEIGHT) / 2,
            paddle2Y: (COURT_HEIGHT - PADDLE_HEIGHT) / 2,
            paddleWidth: PADDLE_WIDTH,
            paddleHeight: PADDLE_HEIGHT,
            score1: 0,
            score2: 0,
            isPlaying: true,
        };
    }

    /**
     * Game loop for a match. Resets game state after game over for rematch support.
     */
    private startGameLoop(match: Match): void {
        const interval = setInterval(() => {
            this.updateBall(match);

            // End game if max score reached
            if (match.state.score1 >= MAX_SCORE || match.state.score2 >= MAX_SCORE) {
                clearInterval(interval);
                this.gameLoops.delete(match.roomId);

                const winner = match.state.score1 >= MAX_SCORE ? 1 : 2;
                // Inform both players
                this.send(match.player1.socket, {
                    type: "game_over",
                    roomId: match.roomId,
                    data: {
                        winner,
                        finalScore: {
                            player1: match.state.score1,
                            player2: match.state.score2,
                        },
                    },
                });
                this.send(match.player2.socket, {
                    type: "game_over",
                    roomId: match.roomId,
                    data: {
                        winner,
                        finalScore: {
                            player1: match.state.score1,
                            player2: match.state.score2,
                        },
                    },
                });

                // Remove both players from matches
                this.matches.delete(match.player1.userId);
                this.matches.delete(match.player2.userId);

                // Close sockets after a short delay to ensure game_over delivery
                // setTimeout(() => {
                //     match.player1.socket.close();
                //     match.player2.socket.close();
                // }, 1000);

                return;
            }

            this.broadcastGameState(match);
        }, 1000 / 60);
        this.gameLoops.set(match.roomId, interval);
    }

    private updateBall(match: Match): void {
        const state = match.state;
        state.ballX += state.ballVelX;
        state.ballY += state.ballVelY;

        // Wall collision
        if (state.ballY <= 0 || state.ballY >= COURT_HEIGHT - BALL_RADIUS) {
            state.ballVelY *= -1;
        }

        // Paddle collision
        if (
            state.ballX <= 32 + PADDLE_WIDTH &&
            state.ballY > state.paddle1Y &&
            state.ballY < state.paddle1Y + PADDLE_HEIGHT
        ) {
            state.ballVelX *= -1;
            state.ballX = 32 + PADDLE_WIDTH;
        }
        if (
            state.ballX >= COURT_WIDTH - 32 - PADDLE_WIDTH &&
            state.ballY > state.paddle2Y &&
            state.ballY < state.paddle2Y + PADDLE_HEIGHT
        ) {
            state.ballVelX *= -1;
            state.ballX = COURT_WIDTH - 32 - PADDLE_WIDTH;
        }

        if (state.ballX < 0) {
            state.score2 += 1;
            this.resetBall(state, 4);
        }
        if (state.ballX > COURT_WIDTH) {
            state.score1 += 1;
            this.resetBall(state, -4);
        }
    }

    private resetBall(state: GameState, velX: number) {
        state.ballX = BALL_START_X;
        state.ballY = BALL_START_Y;
        state.ballVelX = velX;
        state.ballVelY = Math.random() > 0.5 ? 6 : -6;
    }
}

export const matchmaker = new Matchmaker();
