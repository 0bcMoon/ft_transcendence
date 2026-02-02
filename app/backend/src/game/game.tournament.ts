import { WebSocket } from 'ws';
import { getPlayersMap, getPlayer } from './game.server';
import { Player, Side, TournamentMatch } from './game.types';
import { initState, moveBall, isGameOver, handlePaddleCollision, handleScoring } from './game.physics';
import gameRepository from '../repository/gameRepository';
import tournamentRepository from '../repository/tournamentRepository';
import { updatePaddle, updatePlayerProgress } from './game.utils';
import { sendMessage } from './game.utils';
import { userRepository } from '../repository/userRepository';
import { MAX_SCORE } from './constants';

const tournamentMatches = new Map<number, TournamentMatch>();
const tournamentQueues = new Map<string, Player[]>();

export function getTournamentMatch(userId: number): TournamentMatch | undefined {
    const player = getPlayer(userId);
    return player?.gameId ? tournamentMatches.get(player.gameId) : undefined;
}


export function startTournamentGameLoop(gameId: number): void {
    const match = tournamentMatches.get(gameId);
    if (!match) return;
    if (match.loop) clearInterval(match.loop);

    match.loop = setInterval(() => {
        updatePaddle(match.state.leftPaddle, match.keys.left);
        updatePaddle(match.state.rightPaddle, match.keys.right);


        moveBall(match.state.ball);
        handlePaddleCollision(match.state);
        handleScoring(match.state.ball, match.state.score);

        if (isGameOver(match.state.score)) {
            endGame(match);
            return;
        }

        if (match.players.left?.socket?.readyState === WebSocket.OPEN) {
            sendMessage(match.players.left, { type: 'state', state: match.state });
        }
        if (match.players.right?.socket?.readyState === WebSocket.OPEN) {
            sendMessage(match.players.right, { type: 'state', state: match.state });
        }
    }, 16);
}

function stopGameLoop(match: TournamentMatch): void {
    if (match.loop) {
        clearInterval(match.loop);
        match.loop = undefined;
    }
}

async function cancelGame(gameId: number): Promise<void> {
    await gameRepository.updateStatus(gameId, 'finished');
    tournamentMatches.delete(gameId);
}

async function updateTournamentResult(match: TournamentMatch, winnerId: number): Promise<void> {
    try {
        const gamePlayers = await gameRepository.getPlayers(match.gameId);
        const winnerGamePlayer = gamePlayers.find(p => p.user_id === winnerId);
        if (!winnerGamePlayer)
            return;

        await tournamentRepository.updateMatchWinner(match.tournamentId, match.matchId, winnerId,);
        const allCompleted = await tournamentRepository.areAllMatchesCompleted(match.tournamentId,);

        if (allCompleted) {
            await tournamentRepository.advanceRound(match.tournamentId);
        }

    } catch (err) {
        console.error(`Failed to update tournament: `, err);
    }
}

async function endGame(match: TournamentMatch): Promise<void> {
    if (!match)
        return;
    stopGameLoop(match);
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
        return; // No winner yet

    const winnerPlayer = winner === 'left' ? match.players.left : match.players.right;
    const loserPlayer = winner === 'left' ? match.players.right : match.players.left;
    const winnerId = winnerPlayer?.id;

    try {
        await gameRepository.SetPlayerScore(match.gameId, 1, match.state.score.left);
        await gameRepository.SetPlayerScore(match.gameId, 2, match.state.score.right);
        await gameRepository.finishGame(match.gameId, winnerId ?? null);

        if (winnerId) {
            await updatePlayerProgress(match, winnerId);
            await updateTournamentResult(match, winnerId);
        }

        if (winnerPlayer?.socket?.readyState === WebSocket.OPEN) {
            sendMessage(winnerPlayer, { type: 'gameOver', winner, score: match.state.score });
        }

        // Notify loser
        if (loserPlayer?.socket?.readyState === WebSocket.OPEN) {
            sendMessage(loserPlayer, { type: 'gameOver', winner, score: match.state.score });
        }


        tournamentMatches.delete(match.gameId);
        console.log(`Tournament game ${match.gameId} ended.  Winner: ${winnerId}`);
    } catch (err) {
        console.error(`Failed to end game ${match.gameId}: `, err);
    }
}

function createTournamentMatch(gameId: number, tournamentId: number, matchId: number, player1: Player, player2: Player): TournamentMatch {
    return {
        gameId,
        players: { left: player1, right: player2 },
        ready: { left: false, right: false },
        state: initState(),
        keys: { left: { up: false, down: false }, right: { up: false, down: false } },
        tournamentId,
        matchId,
    };
}

function getQueueKey(tournamentId: number, matchId: number): string {
    return `${tournamentId}-${matchId}`;
}

function getQueue(tournamentId: number, matchId: number): Player[] {
    const key = getQueueKey(tournamentId, matchId);
    if (!tournamentQueues.has(key)) {
        tournamentQueues.set(key, []);
    }
    return tournamentQueues.get(key)!;
}

function handlePlayerDisconnect(userId: number, match: TournamentMatch): void {
    stopGameLoop(match);

    const remainingSide: Side = match.players.left?.id === userId ? 'right' : 'left';
    const remainingPlayer = match.players[remainingSide];

    if (remainingPlayer?.socket?.readyState === WebSocket.OPEN) {
        sendMessage(remainingPlayer, { type: 'opponentLeft' });
        endGame(match);
        console.log(`Player ${userId} left.  Player ${remainingPlayer.id} wins by forfeit`);
    } else {
        void cancelGame(match.gameId);
        tournamentMatches.delete(match.gameId);
        console.log(`Both players disconnected from match ${match.gameId}`);
    }
}

export function cleanupTournamentPlayer(userId: number): void {
    const match = getTournamentMatch(userId);
    if (match) {
        handlePlayerDisconnect(userId, match);
    }

    tournamentQueues.forEach((queue) => {
        const index = queue.findIndex(p => p.id === userId);
        if (index > -1) {
            queue.splice(index, 1);
        }
    });
}

export async function handleTournamentGame(data: { tournamentId: number; matchId: number }, userId: number, socket: WebSocket): Promise<void> {
    console.log(data, userId, 'joining tournament match');
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
        mode: 'tournament'
    };

    const playersMap = getPlayersMap();
    playersMap.set(userId, player);


    try {
        const matchData = await tournamentRepository.getTournamentMatchDetails(data.tournamentId, data.matchId);

        if (!matchData?.game_id) {
            sendMessage(player, { type: 'error', message: 'Match not found' });
            return;
        }

        if (matchData.player1_user_id !== player.id && matchData.player2_user_id !== player.id) {
            sendMessage(player, { type: 'error', message: 'You are not in this match' });
            return;
        }

        const queue = getQueue(data.tournamentId, data.matchId);

        const existingIndex = queue.findIndex(p => p.id === player.id);
        if (existingIndex !== -1) {
            queue.splice(existingIndex, 1);
        }

        queue.push(player);

        if (queue.length >= 2) {
            const player1 = queue.shift()!;
            const player2 = queue.shift()!;

            if (player1.socket?.readyState === WebSocket.OPEN && player2.socket?.readyState === WebSocket.OPEN) {

                const match = createTournamentMatch(
                    matchData.game_id,
                    data.tournamentId,
                    data.matchId,
                    player1,
                    player2,
                );

                tournamentMatches.set(matchData.game_id, match);
                player1.gameId = matchData.game_id;
                player2.gameId = matchData.game_id;

                sendMessage(player1, { type: 'matchFound', side: 'left', playerNames: { left: player1.username, right: player2.username }, playerAvatars: { left: player1.avatar, right: player2.avatar } });
                sendMessage(player2, { type: 'matchFound', side: 'right', playerNames: { left: player1.username, right: player2.username }, playerAvatars: { left: player1.avatar, right: player2.avatar } });

                await tournamentRepository.updateMatchStatus(match.matchId, 'playing');
            } else {
                if (player1.socket?.readyState === WebSocket.OPEN) {
                    queue.unshift(player1);
                }
                if (player2.socket?.readyState === WebSocket.OPEN) {
                    queue.unshift(player2);
                }
                console.log(`Match failed - player disconnected. Queue length: ${queue.length}`);
            }
        }
    } catch (err) {
        console.error(`Failed to join tournament match:`, err);
        sendMessage(player, { type: 'error', message: 'Failed to join tournament match' });
    }
}
