import { WebSocket } from 'ws';
import { ClientMessage, Player } from './game.types';
import {
    handleRemoteGame,
    cleanupRemotePlayer,
    getRemoteMatch,
    startRemoteGameLoop
} from './game.remote';
import {
    startTournamentGameLoop,
    handleTournamentGame,
    cleanupTournamentPlayer,
    getTournamentMatch
} from './game.tournament';
import gameRepository from '../repository/gameRepository';
import { getPlayerSide, handleMove } from './game.utils';

const players = new Map<number, Player>();

export function getPlayer(userId: number): Player | undefined {
    return players.get(userId);
}

export function getPlayersMap(): Map<number, Player> {
    return players;
}

function cleanupPlayer(userId: number): void {
    const player = getPlayer(userId);
    if (!player) return;

    if (player.mode === 'remote') {
        cleanupRemotePlayer(userId);
    } else if (player.mode === 'tournament') {
        cleanupTournamentPlayer(userId);
    }

    player.mode = undefined;
}

async function handleReady(userId: number): Promise<void> {
    const player = getPlayer(userId);
    if (!player) return;

    if (player.mode === 'remote') {
        const match = getRemoteMatch(userId);
        if (!match) return;

        const side = getPlayerSide(userId, match);
        if (!side) return;

        match.ready[side] = true;

        if (match.ready.left && match.ready.right) {
            await gameRepository.start(match.gameId);
            startRemoteGameLoop(match.gameId);
        }
    } else if (player.mode === 'tournament') {
        const match = getTournamentMatch(userId);
        if (!match) return;

        const side = getPlayerSide(userId, match);
        if (!side) return;

        match.ready[side] = true;

        if (match.ready.left && match.ready.right) {
            await gameRepository.start(match.gameId);
            startTournamentGameLoop(match.gameId);
        }
    }
}

function handlePlayAgain(userId: number): void {
    const player = getPlayer(userId);
    if (!player?.socket) return;

    const socket = player.socket;
    cleanupPlayer(userId);
    handleRemoteGame(userId, socket);
}

export const handleMessage = (userId: number, data: ClientMessage, socket: WebSocket): void => {
    switch (data.type) {
        case "remote":
            handleRemoteGame(userId, socket);
            break;

        case "tournament":
            handleTournamentGame(data, userId, socket);
            break;

        case "ready":
            handleReady(userId);
            break;

        case "move":
            handleMove(userId, data);
            break;

        case "playAgain":
            handlePlayAgain(userId);
            break;

        case "leaveGame":
            cleanupPlayer(userId);
            break;
    }
};

export function removePlayer(userId: number): void {
    cleanupPlayer(userId);
    players.delete(userId);
}
