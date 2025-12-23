// game/game.remote.ts

import { WebSocket } from 'ws';
import { ClientMessage, GameMode, Player, Side, GameState } from './game.types';
import { initState, moveBall, checkGameOver, resetBall } from './game.physics';
import { Rules, Paddle, Canvas } from './game.config';
import gameRepository from '../repository/gameRepository';
import { getPlayer } from './game.server';

// TYPES

interface RemoteMatch {
    gameId: number;
    mode: 'remote';
    players: { left: Player; right: Player };
    ready: { left: boolean; right: boolean };
    state: GameState;
    startTime: number;
    keys: {
        left: { up: boolean; down: boolean };
        right: { up: boolean; down: boolean };
    };
    loop?: NodeJS.Timeout;
}

// STATE

const remoteMatches = new Map<number, RemoteMatch>();
const remoteQueue: Player[] = [];

// ============================================================================
// UTILITIES
// ============================================================================

function getRemoteMatch(userId: number): RemoteMatch | undefined {
    const player = getPlayer(userId);
    return player?.gameId ? remoteMatches.get(player.gameId) : undefined;
}

function getPlayerSide(userId: number, match: RemoteMatch): Side | null {
    if (match.players.left?.id === userId) return 'left';
    if (match.players.right?.id === userId) return 'right';
    return null;
}

function sendMessage(player: Player | undefined, message: object): void {
    if (player?.socket?.readyState === WebSocket.OPEN) {
        player.socket.send(JSON.stringify(message));
    }
}

function broadcastToMatch(match: RemoteMatch, message: object): void {
    sendMessage(match.players.left, message);
    sendMessage(match.players.right, message);
}

// ============================================================================
// GAME PHYSICS
// ============================================================================

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function updatePaddle(
    paddle: { y: number } | undefined,
    keys: { up: boolean; down: boolean }
): void {
    if (!paddle) return;

    if (keys.up) paddle.y -= Paddle.SPEED;
    if (keys.down) paddle.y += Paddle.SPEED;
    paddle.y = clamp(paddle.y, 0, Canvas.HEIGHT - Paddle.HEIGHT);
}

function updatePaddles(state: GameState, keys: RemoteMatch['keys']): void {
    updatePaddle(state.leftPaddle, keys.left);
    updatePaddle(state.rightPaddle, keys.right);
}

function startGameLoop(gameId: number): void {
    const match = remoteMatches.get(gameId);
    if (!match) return;

    match.loop = setInterval(() => {
        updatePaddles(match.state, match.keys);

        moveBall(match.state, (scorer: Side) => {
            if (checkGameOver(match.state)) {
                const winner = match.state.score.left >= Rules.MAX_SCORE ? 'left' : 'right';
                void endGame(match, winner);
            } else {
                resetBall(match.state, scorer);
            }
        });

        broadcastToMatch(match, { type: 'state', state: match.state });
    }, 16);
}

function stopGameLoop(match: RemoteMatch): void {
    if (match.loop) {
        clearInterval(match.loop);
        match.loop = undefined;
    }
}

// ============================================================================
// GAME PERSISTENCE
// ============================================================================

async function saveGameScores(match: RemoteMatch): Promise<void> {
    await gameRepository.updatePlayerScore(match.gameId, 1, match.state.score.left);
    await gameRepository.updatePlayerScore(match.gameId, 2, match.state.score.right);
}

async function saveGameResult(gameId: number, winnerId: number | null): Promise<void> {
    await gameRepository.finish(gameId, winnerId);
}

async function cancelGame(gameId: number): Promise<void> {
    try {
        await gameRepository.cancel(gameId);
        console.log(`✅ Game ${gameId} cancelled`);
    } catch (err) {
        console.error(`❌ Failed to cancel game ${gameId}:`, err);
    }
}

// ============================================================================
// ELO SYSTEM
// ============================================================================

async function updateEloRatings(match: RemoteMatch, winnerId: number): Promise<void> {
    try {
        const gamePlayers = await gameRepository.getPlayers(match.gameId);
        if (!gamePlayers || gamePlayers.length !== 2) {
            throw new Error("Could not find both players in game_players for ELO update");
        }

        const [gp1, gp2] = gamePlayers;
        const userIds = [gp1.user_id, gp2.user_id].filter(Boolean) as number[];
        
        if (userIds.length === 2) {
            const [uid1, uid2] = userIds;
            const loserId = uid1 === winnerId ? uid2 : uid1;
            
            console.log(`🔄 Updating ELO for winner ${winnerId} and loser ${loserId}`);

            const [winnerStats, loserStats] = await Promise.all([
                gameRepository.getPlayerStats(winnerId),
                gameRepository.getPlayerStats(loserId),
            ]);

            if (winnerStats && loserStats) {
                console.log(`[ELO] Before - Winner ${winnerId}: ${winnerStats.elo_rating}, Loser ${loserId}: ${loserStats.elo_rating}`);
                
                // ELO formula
                const K = 24;
                const expected = 1 / (1 + Math.pow(10, (loserStats.elo_rating - winnerStats.elo_rating) / 400));
                const diff = Math.round(K * (1 - expected));
                const newWinnerElo = winnerStats.elo_rating + diff;
                const newLoserElo = loserStats.elo_rating - diff;
                
                const getRank = (elo: number) => {
                    if (elo >= 1600) return "Master";
                    if (elo >= 1400) return "Platinum";
                    if (elo >= 1200) return "Gold";
                    if (elo >= 1000) return "Silver";
                    return "Bronze";
                };

                await Promise.all([
                    gameRepository.updatePlayerStats(
                        winnerId,
                        newWinnerElo,
                        getRank(newWinnerElo),
                        winnerStats.wins + 1,
                        winnerStats.losses
                    ),
                    gameRepository.updatePlayerStats(
                        loserId,
                        newLoserElo,
                        getRank(newLoserElo),
                        loserStats.wins,
                        loserStats.losses + 1
                    ),
                    gameRepository.insertEloHistory({
                        user_id: winnerId,
                        game_id: match.gameId,
                        elo_change: diff,
                        new_elo: newWinnerElo,
                        result: "win",
                    }),
                    gameRepository.insertEloHistory({
                        user_id: loserId,
                        game_id: match.gameId,
                        elo_change: -diff,
                        new_elo: newLoserElo,
                        result: "loss",
                    }),
                ]);

                console.log(`[ELO] Winner ${winnerId} -> ${newWinnerElo} (+${diff}), Loser ${loserId} -> ${newLoserElo} (${-diff})`);
            }
        } else {
            throw new Error("game_players has less than 2 human users for this game.");
        }
    } catch (err) {
        console.error("ELO/rank update failed:", err);
    }
}

// ============================================================================
// GAME END
// ============================================================================

async function endGame(match: RemoteMatch, winner: Side): Promise<void> {
    stopGameLoop(match);

    const winnerId = winner === 'left'
        ? match.players.left?.id
        : match.players.right?.id;

    try {
        await saveGameScores(match);
        await saveGameResult(match.gameId, winnerId ?? null);

        if (winnerId) {
            await updateEloRatings(match, winnerId);
        }

        broadcastToMatch(match, {
            type: 'gameOver',
            winner,
            score: match.state.score
        });

        remoteMatches.delete(match.gameId);
        console.log(`✅ Game ${match.gameId} ended. Winner: ${winnerId}`);
    } catch (err) {
        console.error(`❌ Failed to end game ${match.gameId}:`, err);
    }
}

// ============================================================================
// REMOTE GAME CREATION
// ============================================================================

async function createRemoteGame(player1: Player, player2: Player): Promise<number> {
    return await gameRepository.createGameAndAddPlayers('remote', [
        { user_id: player1.id, position: 1 },
        { user_id: player2.id, position: 2 }
    ]);
}

function createRemoteMatch(gameId: number, player1: Player, player2: Player): RemoteMatch {
    console.log('Creating remote match:', { gameId, player1, player2 });
    return {
        gameId,
        mode: 'remote',
        players: { left: player1, right: player2 },
        ready: { left: false, right: false },
        state: initState(),
        startTime: Date.now(),
        keys: {
            left: { up: false, down: false },
            right: { up: false, down: false }
        }
    };
}

function notifyRemoteMatchFound(match: RemoteMatch): void {
    const { left, right } = match.players;

    const baseMessage = {
        type: 'matchFound',
        id: match.gameId.toString(),
        mode: 'remote' as GameMode,
        playerNames: { left: left.username, right: right.username },
        playerAvatars: { left: left.avatar, right: right.avatar }
    };

    sendMessage(left, { ...baseMessage, side: 'left' });
    sendMessage(right, { ...baseMessage, side: 'right' });
}

async function matchRemotePlayers(player1: Player, player2: Player): Promise<void> {
    try {
        const gameId = await createRemoteGame(player1, player2);
        const match = createRemoteMatch(gameId, player1, player2);

        remoteMatches.set(gameId, match);
        player1.gameId = gameId;
        player2.gameId = gameId;

        notifyRemoteMatchFound(match);
        console.log(`✅ Remote match ${gameId}: ${player1.username} vs ${player2.username}`);
    } catch (err) {
        console.error('❌ Failed to create remote match:', err);
    }
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

function addToRemoteQueue(player: Player): void {
    console.log(`🎮 ${player.username} joining remote queue...`);
    remoteQueue.push(player);

    if (remoteQueue.length >= 2) {
        const player1 = remoteQueue.shift()!;
        const player2 = remoteQueue.shift()!;
        void matchRemotePlayers(player1, player2);
    }
}

export function removeFromRemoteQueue(userId: number): void {
    const index = remoteQueue.findIndex(p => p.id === userId);
    if (index > -1) {
        remoteQueue.splice(index, 1);
    }
}

// ============================================================================
// PLAYER DISCONNECT
// ============================================================================

function handlePlayerDisconnect(userId: number, match: RemoteMatch): void {
    stopGameLoop(match);

    const remainingSide: Side = match.players.left?.id === userId ? 'right' : 'left';
    const remainingPlayer = match.players[remainingSide];

    if (remainingPlayer?.socket?.readyState === WebSocket.OPEN) {
        sendMessage(remainingPlayer, { type: 'opponentLeft' });
        void endGame(match, remainingSide);
        console.log(`✅ Player ${userId} left. ${remainingPlayer.id} wins by forfeit`);
    } else {
        void cancelGame(match.gameId);
        remoteMatches.delete(match.gameId);
        console.log(`✅ Both players disconnected from match ${match.gameId}`);
    }
}

export function cleanupRemotePlayer(userId: number): void {
    const match = getRemoteMatch(userId);
    if (match) {
        handlePlayerDisconnect(userId, match);
    }

    removeFromRemoteQueue(userId);
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function handleRemoteGame(
    player: Player,
    action: 'join' | 'ready' | 'move',
    tournamentId?: number,
    matchId?: number,
    moveData?: ClientMessage & { type: 'move' }
): Promise<void> {
    switch (action) {
        case 'join':
            addToRemoteQueue(player);
            break;

        case 'ready': {
            const match = getRemoteMatch(player.id);
            if (!match) return;

            const side = getPlayerSide(player.id, match);
            if (!side) return;

            match.ready[side] = true;

            if (match.ready.left && match.ready.right) {
                try {
                    await gameRepository.start(match.gameId);
                    console.log(`✅ Remote match ${match.gameId} starting!`);
                    startGameLoop(match.gameId);
                } catch (err) {
                    console.error('❌ Failed to start game:', err);
                }
            }
            break;
        }

        case 'move': {
            const match = getRemoteMatch(player.id);
            if (!match || !moveData) return;

            const side = getPlayerSide(player.id, match);
            if (!side) return;

            match.keys[side].up = moveData.up ?? false;
            match.keys[side].down = moveData.down ?? false;
            break;
        }
    }
}
