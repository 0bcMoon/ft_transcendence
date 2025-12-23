// game/game.server.ts

import { WebSocket } from 'ws';
import { ClientMessage, Player } from './game.types';
import { handleRemoteGame, cleanupRemotePlayer } from './game.remote';
import { handleTournamentGame, cleanupTournamentPlayer } from './game.tournament'

// ============================================================================
// STATE
// ============================================================================

const players = new Map<number, Player>();

// ============================================================================
// UTILITIES
// ============================================================================

export function getPlayer(userId: number): Player | undefined {
    return players.get(userId);
}

function cleanupPlayer(userId: number): void {
    const player = getPlayer(userId);
    if (!player) return;

    // Clean up based on mode
    if (player.mode === 'remote') {
        cleanupRemotePlayer(userId);
    } else if (player.mode === 'tournament') {
        cleanupTournamentPlayer(userId);
    }

    player.gameId = undefined;
    player.mode = undefined;
    console.log(`✅ Player ${userId} cleaned up`);
}

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

async function handleJoinGame( userId: number, data: ClientMessage & { type: 'joinGame' }, socket: WebSocket): Promise<void> {
    console.log('/////////////data', data.avatar);
    const player: Player = {
        id: userId,
        username: data.username,
        avatar: data.avatar,
        socket,
        mode: data.mode
    };

    players.set(userId, player);

    if (data.mode === 'remote') {
        await handleRemoteGame(player, 'join');
    }
    else if (data.mode === 'tournament') {
        await handleTournamentGame(player, 'join', data.tournamentId, data.matchId);
    }
}

async function handleReady(userId: number): Promise<void> {
    const player = getPlayer(userId);
    if (!player) return;

    if (player.mode === 'remote') {
        await handleRemoteGame(player, 'ready');
    } else if (player.mode === 'tournament') {
        await handleTournamentGame(player, 'ready');
    }
}

function handleMove(userId: number, data: ClientMessage & { type: 'move' }): void {
    const player = getPlayer(userId);
    if (!player) 
        return;

    if (player.mode === 'remote') {
        handleRemoteGame(player, 'move', undefined, undefined, data);
    } else if (player.mode === 'tournament') {
        handleTournamentGame(player, 'move', undefined, undefined, data);
    }
}

function handlePlayAgain(userId: number): void {
    const player = getPlayer(userId);
    if (!player) 
        return;

    cleanupPlayer(userId);

    void handleJoinGame(
        userId,
        {
            type: 'joinGame',
            username: player.username,
            avatar: player.avatar,
            mode: 'remote'
        },
        player.socket!
    );
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function handleMessage( userId: number, data: ClientMessage, socket: WebSocket): void {
    if (data.type === 'joinGame') {
        void handleJoinGame(userId, data, socket);
        return;
    }

    const player = getPlayer(userId);
    if (!player) {
        socket.close(1008, 'Player not registered');
        return;
    }

    player.socket = socket;

    switch (data.type) {
        case 'ready':
            void handleReady(userId);
            break;
        case 'move':
            handleMove(userId, data);
            break;
        case 'playAgain':
            handlePlayAgain(userId);
            break;
        case 'leaveGame':
            cleanupPlayer(userId);
            break;
        default:
            console.warn(`Unknown message type: ${(data as any).type}`);
    }
}

export function removePlayer(userId: number): void {
    cleanupPlayer(userId);
    players.delete(userId);
    console.log(`Player ${userId} removed`);
}
