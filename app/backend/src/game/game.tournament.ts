// game/game.tournament.ts

import { WebSocket } from 'ws';
import { ClientMessage, GameMode, Player, Side, GameState } from './game.types';
import { initState, moveBall, checkGameOver, resetBall } from './game.physics';
import { Rules, Paddle, Canvas } from './game.config';
import gameRepository from '../repository/gameRepository';
import tournamentRepository from '../repository/tournamentRepository';
import { getPlayer } from './game.server';

// ============================================================================
// TYPES
// ============================================================================

interface TournamentMatch {
    gameId: number;
    mode: 'tournament';
    players: { left?: Player; right?: Player };
    ready: { left: boolean; right: boolean };
    state: GameState;
    startTime: number;
    keys: {
        left: { up: boolean; down: boolean };
        right: { up: boolean; down: boolean };
    };
    loop?: NodeJS.Timeout;
    tournamentId: number;
    matchId: number;
    round: number;
    matchNumber: number;
}

// ============================================================================
// STATE
// ============================================================================

const tournamentMatches = new Map<number, TournamentMatch>();

// ============================================================================
// UTILITIES
// ============================================================================

function getTournamentMatch(userId: number): TournamentMatch | undefined {
    const player = getPlayer(userId);
    return player?.gameId ? tournamentMatches.get(player.gameId) : undefined;
}

function getPlayerSide(userId: number, match: TournamentMatch): Side | null {
    if (match.players.left?.id === userId) return 'left';
    if (match.players.right?.id === userId) return 'right';
    return null;
}

function sendMessage(player: Player | undefined, message: object): void {
    if (player?.socket?.readyState === WebSocket.OPEN) {
        player.socket.send(JSON.stringify(message));
    }
}

function sendError(player: Player, message: string): void {
    sendMessage(player, { type: 'error', message });
}

function broadcastToMatch(match: TournamentMatch, message: object): void {
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

function updatePaddles(state: GameState, keys: TournamentMatch['keys']): void {
    updatePaddle(state.leftPaddle, keys.left);
    updatePaddle(state.rightPaddle, keys.right);
}

function startGameLoop(gameId: number): void {
    const match = tournamentMatches.get(gameId);
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

function stopGameLoop(match: TournamentMatch): void {
    if (match.loop) {
        clearInterval(match.loop);
        match.loop = undefined;
    }
}

// ============================================================================
// GAME PERSISTENCE
// ============================================================================

async function saveGameScores(match: TournamentMatch): Promise<void> {
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

async function updateEloRatings(match: TournamentMatch, winnerId: number): Promise<void> {
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
// TOURNAMENT UPDATES
// ============================================================================

async function updateTournamentResult(
    match: TournamentMatch,
    winnerId: number
): Promise<void> {
    try {
        const gamePlayers = await gameRepository.getPlayers(match.gameId);
        const winnerGamePlayer = gamePlayers.find(p => p.user_id === winnerId);
        if (!winnerGamePlayer) return;

        const tournamentPlayers = await tournamentRepository.getPlayers(match.tournamentId);
        const winnerTournamentPlayer = tournamentPlayers.find(p => p.user_id === winnerId);
        if (!winnerTournamentPlayer) return;

        await tournamentRepository.updateMatchWinner(
            match.tournamentId,
            match.matchId,
            winnerTournamentPlayer.id
        );
        await tournamentRepository.advanceRound(match.tournamentId);

        console.log(`✅ Tournament ${match.tournamentId} match ${match.matchId} updated`);
    } catch (err) {
        console.error(`❌ Failed to update tournament:`, err);
    }
}

// ============================================================================
// GAME END
// ============================================================================

async function endGame(match: TournamentMatch, winner: Side): Promise<void> {
    stopGameLoop(match);

    const winnerId = winner === 'left'
        ? match.players.left?.id
        : match.players.right?.id;

    try {
        await saveGameScores(match);
        await saveGameResult(match.gameId, winnerId ?? null);

        if (winnerId) {
            await updateEloRatings(match, winnerId);
            await updateTournamentResult(match, winnerId);
        }

        broadcastToMatch(match, {
            type: 'gameOver',
            winner,
            score: match.state.score
        });

        tournamentMatches.delete(match.gameId);
        console.log(`✅ Tournament game ${match.gameId} ended. Winner: ${winnerId}`);
    } catch (err) {
        console.error(`❌ Failed to end game ${match.gameId}:`, err);
    }
}

// ============================================================================
// TOURNAMENT MATCH CREATION
// ============================================================================

async function fetchTournamentMatchData(tournamentId: number, matchId: number) {
    return await tournamentRepository.getTournamentMatchDetails(tournamentId, matchId);
}

function validateTournamentPlayer(playerId: number, matchData: any): boolean {
    return matchData.player1_user_id === playerId || matchData.player2_user_id === playerId;
}

function createTournamentMatch(
    gameId: number,
    tournamentId: number,
    matchId: number,
    matchData: any
): TournamentMatch {
    return {
        gameId,
        mode: 'tournament',
        players: {},
        ready: { left: false, right: false },
        state: initState(),
        startTime: Date.now(),
        keys: {
            left: { up: false, down: false },
            right: { up: false, down: false }
        },
        tournamentId,
        matchId,
        round: matchData.round,
        matchNumber: matchData.match_number
    };
}

function getOrCreateTournamentMatch(
    gameId: number,
    tournamentId: number,
    matchId: number,
    matchData: any
): TournamentMatch {
    let match = tournamentMatches.get(gameId);

    if (!match) {
        match = createTournamentMatch(gameId, tournamentId, matchId, matchData);
        tournamentMatches.set(gameId, match);
    }

    return match;
}

function assignPlayerToTournamentMatch(
    player: Player,
    match: TournamentMatch,
    matchData: any
): void {
    player.gameId = match.gameId;
    const side: Side = matchData.player1_user_id === player.id ? 'left' : 'right';
    match.players[side] = player;
    console.log(`✅ ${player.username} assigned to ${side} side`);
}

function areBothPlayersConnected(match: TournamentMatch): boolean {
    return !!(match.players.left?.socket && match.players.right?.socket);
}

async function notifyTournamentMatchReady(
    match: TournamentMatch,
    matchData: any
): Promise<void> {
    const baseMessage = {
        type: 'matchFound',
        id: match.gameId.toString(),
        mode: 'tournament' as GameMode,
        playerNames: {
            left: match.players.left?.username || matchData.player1_username,
            right: match.players.right?.username || matchData.player2_username
        },
        playerAvatars: {
            left: match.players.left?.avatar || null,
            right: match.players.right?.avatar || null
        },
        round: matchData.round,
        matchNumber: matchData.match_number,
        tournamentId: match.tournamentId,
        matchId: match.matchId
    };

    sendMessage(match.players.left, { ...baseMessage, side: 'left' });
    sendMessage(match.players.right, { ...baseMessage, side: 'right' });

    await tournamentRepository.updateMatchStatus(match.matchId, 'playing');
    console.log(`✅ Tournament match ${match.matchId} ready`);
}

async function joinTournamentMatch(
    player: Player,
    tournamentId: number,
    matchId: number
): Promise<void> {
    console.log(`🏆 ${player.username} joining tournament ${tournamentId} match ${matchId}...`);

    try {
        const matchData = await fetchTournamentMatchData(tournamentId, matchId);

        if (!matchData?.game_id) {
            sendError(player, 'Tournament match not found');
            return;
        }

        if (!validateTournamentPlayer(player.id, matchData)) {
            sendError(player, 'You are not in this match');
            return;
        }

        const match = getOrCreateTournamentMatch(
            matchData.game_id,
            tournamentId,
            matchId,
            matchData
        );

        assignPlayerToTournamentMatch(player, match, matchData);

        // Send tournament info immediately to the joining player
        const side: Side = matchData.player1_user_id === player.id ? 'left' : 'right';
        sendMessage(player, {
            type: 'tournamentInfo',
            round: matchData.round,
            matchNumber: matchData.match_number,
            tournamentId: tournamentId,
            matchId: matchId,
            side: side
        });

        if (areBothPlayersConnected(match)) {
            await notifyTournamentMatchReady(match, matchData);
        } else {
            console.log(`⏳ Waiting for other player in match ${matchId}...`);
        }
    } catch (err) {
        console.error(`❌ Failed to join tournament match:`, err);
        sendError(player, 'Failed to join tournament match');
    }
}

// ============================================================================
// PLAYER DISCONNECT
// ============================================================================

function handlePlayerDisconnect(userId: number, match: TournamentMatch): void {
    stopGameLoop(match);

    const remainingSide: Side = match.players.left?.id === userId ? 'right' : 'left';
    const remainingPlayer = match.players[remainingSide];

    if (remainingPlayer?.socket?.readyState === WebSocket.OPEN) {
        sendMessage(remainingPlayer, { type: 'opponentLeft' });
        void endGame(match, remainingSide);
        console.log(`✅ Player ${userId} left. ${remainingPlayer.id} wins by forfeit`);
    } else {
        void cancelGame(match.gameId);
        tournamentMatches.delete(match.gameId);
        console.log(`✅ Both players disconnected from match ${match.gameId}`);
    }
}

export function cleanupTournamentPlayer(userId: number): void {
    const match = getTournamentMatch(userId);
    if (match) {
        handlePlayerDisconnect(userId, match);
    }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function handleTournamentGame(
    player: Player,
    action: 'join' | 'ready' | 'move',
    tournamentId?: number,
    matchId?: number,
    moveData?: ClientMessage & { type: 'move' }
): Promise<void> {
    switch (action) {
        case 'join':
            if (tournamentId && matchId) {
                await joinTournamentMatch(player, tournamentId, matchId);
            } else {
                sendError(player, 'Tournament ID and Match ID are required');
            }
            break;

        case 'ready': {
            const match = getTournamentMatch(player.id);
            if (!match) return;

            const side = getPlayerSide(player.id, match);
            if (!side) return;

            match.ready[side] = true;

            if (match.ready.left && match.ready.right) {
                console.log(`✅ Tournament match ${match.matchId} starting!`);
                startGameLoop(match.gameId);
            }
            break;
        }

        case 'move': {
            const match = getTournamentMatch(player.id);
            if (!match || !moveData) return;

            const side = getPlayerSide(player.id, match);
            if (!side) return;

            match.keys[side].up = moveData.up ?? false;
            match.keys[side].down = moveData.down ?? false;
            break;
        }
    }
}
