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

    if (!match)
        return;

    if (match.loop) 
        clearInterval(match.loop);

    match.loop = setInterval(() => {

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
            return;
        }
    }, 16);
    console.log(match.loop);
}

export async function endGame(match: Match): Promise<void> {
    if (!match)
        return;

    if (match.loop) {
        clearInterval(match.loop);
        match.loop = undefined;
    }

    let winner: Side | undefined;
    if (match.state.score.left >= MAX_SCORE)
        winner = 'left';
    else if (match.state.score.right >= MAX_SCORE)
        winner = 'right';

    if (!winner) 
        return;

    const winnerPlayer = winner === 'left' ? match.players.left : match.players.right;
    const loserPlayer = winner === 'left' ? match.players.right : match.players.left;
    const winnerId = winnerPlayer?.id;

    // Save scores & finish game
    await gameRepository.SetPlayerScore(match.gameId, 1, match.state.score.left);
    await gameRepository.SetPlayerScore(match.gameId, 2, match.state.score.right);
    await gameRepository.finishGame(match.gameId, winnerId);

    await updatePlayerProgress(match, winnerId);

    sendMessage(winnerPlayer, { type: 'gameOver', winner, score: match.state.score });
    sendMessage(loserPlayer, { type: 'gameOver', winner, score: match.state.score });

    if (winnerPlayer) 
        winnerPlayer.gameId = undefined;
    if (loserPlayer)
        loserPlayer.gameId = undefined;

    remoteMatches.delete(match.gameId);
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

    const player = getPlayer(userId);
    if (player) {
        player.gameId = undefined;
    }
}

export function cleanupRemotePlayer(userId: number): void {

    const match = getRemoteMatch(userId);

    if (match) {
        if (match.loop) {
            clearInterval(match.loop);
            match.loop = undefined;
        }
        endGame(match);
    }
    removeFromQueue(userId);
}

export async function handleRemoteGame(userId: number, socket: WebSocket): Promise<void> {

    const user = await userRepository.getCurrentUserById(userId);

    if (!user) {
        sendMessage({ id: userId, socket } as Player, { type: 'error', message: 'User not found', });
        return;
    }

    const player: Player = {
        id: userId,
        username: user.username,
        avatar: user.image_src + user.profile_picture,
        socket: socket,
        mode: 'remote',
    };

    getPlayersMap().set(userId, player);

    removeFromQueue(userId);

    remoteQueue.push(player);

    await MatchPlayers();

}

async function MatchPlayers(): Promise<void> {

    if (remoteQueue.length < 2) {
        return;
    }

    const player1 = remoteQueue.shift()!;
    const player2 = remoteQueue.shift()!;

    const gameId = await gameRepository.createGame('remote');
    await gameRepository.addPlayer(gameId, player1.id, 1);
    await gameRepository.addPlayer(gameId, player2.id, 2);

    const match = createRemoteMatch(gameId, player1, player2);
    remoteMatches.set(gameId, match);

    player1.gameId = gameId;
    player2.gameId = gameId;

    const matchFoundMessage = {
        left: {
            type: 'matchFound',
            side: 'left',
            playerNames: { left: player1.username, right: player2.username },
            playerAvatars: { left: player1.avatar, right: player2.avatar },
        },
        right: {
            type: 'matchFound',
            side: 'right',
            playerNames: { left: player1.username, right: player2.username },
            playerAvatars: { left: player1.avatar, right: player2.avatar },
        },
    };

    sendMessage(player1, matchFoundMessage.left);
    sendMessage(player2, matchFoundMessage.right);

}
