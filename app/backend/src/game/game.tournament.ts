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

        if (match.players.left?.socket?.readyState === WebSocket.OPEN) {
            sendMessage(match.players.left, { type: 'state', state: match.state });
        }

        if (match.players.right?.socket?.readyState === WebSocket.OPEN) {
            sendMessage(match.players.right, { type: 'state', state: match.state });
        }

        if (isGameOver(match.state.score)) {
            endGame(match);
        }
    }, 16);
}

async function updateTournamentResult(match: TournamentMatch, winnerId: number): Promise<void> {
    try {
        await tournamentRepository.updateMatchWinner(match.tournamentId, match.matchId, winnerId);

        const allCompleted = await tournamentRepository.areAllMatchesCompleted(match.tournamentId);
        if (allCompleted) {
            await tournamentRepository.advanceRound(match.tournamentId);
        }
    } catch (err) {
        console.error(`Failed to update tournament:`, err);
    }
}

async function endGame(match: TournamentMatch): Promise<void> {
    if (!match) return;

    if (match.loop) {
        clearInterval(match.loop);
        match.loop = undefined;
    }

    let winner: Side | undefined;
    if (match.state.score.left >= MAX_SCORE) winner = 'left';
    else if (match.state.score.right >= MAX_SCORE) winner = 'right';

    if (!winner) return;

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

        sendMessage(winnerPlayer, { type: 'gameOver', winner, score: match.state.score });
        sendMessage(loserPlayer, { type: 'gameOver', winner, score: match.state.score });

        if (winnerPlayer) winnerPlayer.gameId = undefined;
        if (loserPlayer) loserPlayer.gameId = undefined;

        tournamentMatches.delete(match.gameId);
        console.log(`Tournament game ${match.gameId} ended. Winner: ${winnerId}`);
    } catch (err) {
        console.error(`Failed to end game ${match.gameId}:`, err);
    }
}

function createTournamentMatch(gameId: number, tournamentId: number, matchId: number, player1: Player, player2: Player): TournamentMatch {
    return {
        gameId,
        players: { left: player1, right: player2 },
        ready: { left: false, right: false },
        state: initState(),
        keys: {
            left: { up: false, down: false },
            right: { up: false, down: false },
        },
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

function removeFromQueue(userId: number, tournamentId: number, matchId: number): void {
    const queue = getQueue(tournamentId, matchId);
    const index = queue.findIndex((p) => p.id === userId);
    if (index > -1) {
        queue.splice(index, 1);
    }
}

export function cleanupTournamentPlayer(userId: number): void {
    const match = getTournamentMatch(userId);

    if (match) {
        const loserSide = match.players.left?.id === userId ? 'left' : 'right';
        const winnerSide: Side = loserSide === 'left' ? 'right' : 'left';

        match.state.score[winnerSide] = MAX_SCORE;
        endGame(match);
    }

    tournamentQueues.forEach((queue) => {
        const index = queue.findIndex((p) => p.id === userId);
        if (index > -1) {
            queue.splice(index, 1);
        }
    });
}

export async function handleTournamentGame(
    data: { tournamentId: number; matchId: number },
    userId: number,
    socket: WebSocket
): Promise<void> {
    const user = await userRepository.getCurrentUserById(userId);

    if (!user) {
        socket.close();
        return;
    }

    // Check match details first
    const matchData = await tournamentRepository.getTournamentMatchDetails(
        data.tournamentId,
        data.matchId
    );

    if (!matchData?.game_id) {
        sendMessage({ id: userId, socket } as Player, {
            type: 'error',
            message: 'Match not found',
        });
        socket.close();
        return;
    }

    // Check if player is in this match
    if (matchData.player1_user_id !== userId && matchData.player2_user_id !== userId) {
        sendMessage({ id: userId, socket } as Player, {
            type: 'error',
            message: 'You are not in this match',
        });
        socket.close();
        return;
    }

    if (matchData.status === 'completed') {
        sendMessage({ id: userId, socket } as Player, {
            type: 'error',
            message: 'This match has already been completed',
        });
        socket.close();
        return;
    }

    // Handle forfeit if player is in another game
    const existingPlayer = getPlayer(userId);
    if (existingPlayer?.gameId) {
        const existingMatch = tournamentMatches.get(existingPlayer.gameId);

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

    // Create player
    const player: Player = {
        id: userId,
        username: user.username,
        avatar: user.image_src + user.profile_picture,
        socket: socket,
        mode: 'tournament',
        gameId: undefined,
    };

    getPlayersMap().set(userId, player);
    removeFromQueue(userId, data.tournamentId, data.matchId);

    const queue = getQueue(data.tournamentId, data.matchId);
    queue.push(player);

    if (queue.length >= 2) {
        const player1 = queue.shift()!;
        const player2 = queue.shift()!;

        if (
            player1.socket?.readyState === WebSocket.OPEN &&
            player2.socket?.readyState === WebSocket.OPEN
        ) {
            const match = createTournamentMatch(
                matchData.game_id,
                data.tournamentId,
                data.matchId,
                player1,
                player2
            );

            tournamentMatches.set(matchData.game_id, match);
            player1.gameId = matchData.game_id;
            player2.gameId = matchData.game_id;

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

            await tournamentRepository.updateMatchStatus(match.matchId, 'playing');
        } else {
            // Re-add connected players to queue
            if (player1.socket?.readyState === WebSocket.OPEN) {
                queue.unshift(player1);
            }
            if (player2.socket?.readyState === WebSocket.OPEN) {
                queue.unshift(player2);
            }
        }
    }
}
