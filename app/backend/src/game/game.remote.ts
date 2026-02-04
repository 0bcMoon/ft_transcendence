import { getPlayersMap, getPlayer } from './game.server';
import { WebSocket } from 'ws';
import { Player, Side, Match } from './game.types';
import { initState, moveBall, isGameOver, handlePaddleCollision, handleScoring } from './game.physics';
import gameRepository from '../repository/gameRepository';
import { userRepository } from '../repository/userRepository';
import { updatePaddle, updatePlayerProgress } from './game.utils';
import { sendMessage } from './game.utils';
import { MAX_SCORE } from './constants';

const remoteMatches = new Map<number, Match>();
const remoteQueue: Player[] = [];

export function getRemoteMatch(userId: number): Match | undefined {
    const player = getPlayer(userId);
    return player?.gameId ? remoteMatches.get(player.gameId) : undefined;
}

export function startRemoteGameLoop(gameId: number): void {
    const match = remoteMatches.get(gameId);
    if (!match) return;

    if (match.loop) 
        clearInterval(match.loop);

    match.loop = setInterval(() => {
        try {
            updatePaddle(match.state.leftPaddle, match.keys.left);
            updatePaddle(match.state.rightPaddle, match.keys.right);

            moveBall(match.state.ball);
            handlePaddleCollision(match.state);
            handleScoring(match.state.ball, match.state.score);

            if (match.players.left?.socket?.readyState === WebSocket.OPEN) {
                sendMessage(match.players.left, { type: 'state', state: match.state });
            }

            if (match.players.right?.socket?.readyState === WebSocket.OPEN) {
                sendMessage(match.players.right, { type: 'state', state: match.state });
            }

            if (isGameOver(match.state.score)) {
                endGame(match);
            }
        } catch (error) {
            console.error('Error in game loop:', error);
            endGame(match);
        }
    }, 16);
}

export async function endGame(match: Match): Promise<void> {
    if (!match) return;

    if (match.loop) {
        clearInterval(match.loop);
        match.loop = undefined;
    }

    let winner: Side | undefined;
    if (match.state.score.left >= MAX_SCORE) winner = 'left';
    else if (match.state.score.right >= MAX_SCORE) winner = 'right';

    if (!winner) 
        return;

    const winnerPlayer = winner === 'left' ? match.players.left : match.players.right;
    const loserPlayer = winner === 'left' ? match.players.right : match.players.left;
    const winnerId = winnerPlayer?.id;

    try {
        await gameRepository.SetPlayerScore(match.gameId, 1, match.state.score.left);
        await gameRepository.SetPlayerScore(match.gameId, 2, match.state.score.right);
        await gameRepository.finishGame(match.gameId, winnerId);

        await updatePlayerProgress(match, winnerId);

        sendMessage(winnerPlayer, { type: 'gameOver', winner, score: match.state.score });
        sendMessage(loserPlayer, { type: 'gameOver', winner, score: match.state.score });
    } 
    catch (error) {

        sendMessage(winnerPlayer, { type: 'gameOver', winner, score: match.state.score });
        sendMessage(loserPlayer, { type: 'gameOver', winner, score: match.state.score });
    } 
    finally {
        if (winnerPlayer) 
            winnerPlayer.gameId = undefined;
        if (loserPlayer)
            loserPlayer.gameId = undefined;
        remoteMatches.delete(match.gameId);
    }
}

function createRemoteMatch(gameId: number, player1: Player, player2: Player): Match {
    return {
        gameId,
        players: { left: player1, right: player2 },
        ready: { left: false, right: false },
        state: initState(),
        keys: {
            left: { up: false, down: false },
            right: { up: false, down: false },
        },
    };
}

function removeFromQueue(userId: number): void {
    const index = remoteQueue.findIndex((p) => p.id === userId);
    if (index > -1) {
        remoteQueue.splice(index, 1);
    }
}

export function cleanupRemotePlayer(userId: number): void {
    const match = getRemoteMatch(userId);

    if (match) {
        const loserSide = match.players.left?.id === userId ? 'left' : 'right';
        const winnerSide: Side = loserSide === 'left' ? 'right' : 'left';

        match.state.score[winnerSide] = MAX_SCORE;
        endGame(match);
    }

    removeFromQueue(userId);
}

export async function handleRemoteGame(userId: number, socket: WebSocket): Promise<void> {
    try {
        const user = await userRepository.getCurrentUserById(userId);

        if (!user) {
            sendMessage({ id: userId, socket } as Player, {
                type: 'error',
                message: 'User not found',
            });
            socket.close();
            return;
        }

        // Handle existing game forfeit
        const existingPlayer = getPlayer(userId);
        if (existingPlayer?.gameId) {
            const existingMatch = remoteMatches.get(existingPlayer.gameId);

            if (existingMatch) {
                const loserSide = existingMatch.players.left?.id === userId ? 'left' : 'right';
                const winnerSide: Side = loserSide === 'left' ? 'right' : 'left';

                if (existingPlayer.socket?.readyState === WebSocket.OPEN) {
                    existingPlayer.socket.close();
                }

                existingMatch.state.score[winnerSide] = MAX_SCORE;
                await endGame(existingMatch);
            }
        }

        removeFromQueue(userId);

        const player: Player = {
            id: userId,
            username: user.username,
            avatar: user.image_src + user.profile_picture,
            socket: socket,
            mode: 'remote',
            gameId: undefined,
        };

        getPlayersMap().set(userId, player);
        remoteQueue.push(player);

        await matchPlayers();
    } catch (error) {
        console.error('Error in handleRemoteGame:', error);
        sendMessage({ id: userId, socket } as Player, {
            type: 'error',
            message: 'Failed to join game. Please try again.',
        });
        socket.close();
    }
}

async function matchPlayers(): Promise<void> {
    if (remoteQueue.length < 2) return;

    const player1 = remoteQueue.shift()!;
    const player2 = remoteQueue.shift()!;

    try {
        // Validate sockets are still open
        if (player1.socket?.readyState !== WebSocket.OPEN) {
            console.log('Player 1 socket closed, re-adding player 2 to queue');
            if (player2.socket?.readyState === WebSocket.OPEN) {
                remoteQueue.unshift(player2);
            }
            return;
        }

        if (player2.socket?.readyState !== WebSocket.OPEN) {
            console.log('Player 2 socket closed, re-adding player 1 to queue');
            if (player1.socket?.readyState === WebSocket.OPEN) {
                remoteQueue.unshift(player1);
            }
            return;
        }

        const gameId = await gameRepository.createGame('remote');
        await gameRepository.addPlayer(gameId, player1.id, 1);
        await gameRepository.addPlayer(gameId, player2.id, 2);

        const match = createRemoteMatch(gameId, player1, player2);
        remoteMatches.set(gameId, match);

        player1.gameId = gameId;
        player2.gameId = gameId;

        sendMessage(player1, {
            type: 'matchFound',
            side: 'left',
            playerNames: { left: player1.username, right: player2.username },
            playerAvatars: { left: player1.avatar, right: player2.avatar },
        });

        sendMessage(player2, {
            type: 'matchFound',
            side: 'right',
            playerNames: { left: player1.username, right: player2.username },
            playerAvatars: { left: player1.avatar, right: player2.avatar },
        });
    } catch (error) {

        sendMessage(player1, {
            type: 'error',
            message: 'Failed to create match. Please try again.',
        });
        sendMessage(player2, {
            type: 'error',
            message: 'Failed to create match. Please try again.',
        });

        player1.socket?.close();
        player2.socket?.close();
    }
}
