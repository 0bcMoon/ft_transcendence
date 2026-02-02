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
    if (!player)
        return;

    if (player.mode === 'remote') {
        cleanupRemotePlayer(userId);
    }
    else if (player.mode === 'tournament') {
        cleanupTournamentPlayer(userId);
    }

    player.mode = undefined;
}

async function handleReady(userId: number): Promise<void> {
    const player = getPlayer(userId);
    if (!player)
        return;

    if (player.mode === 'remote') {
        const match = getRemoteMatch(player.id);
        if (!match)
            return;

        const side = getPlayerSide(player.id, match);
        if (!side)
            return;

        match.ready[side] = true;

        if (match.ready.left && match.ready.right) {
            await gameRepository.start(match.gameId);
            startRemoteGameLoop(match.gameId);
        }
    }

    else if (player.mode === 'tournament') {
        const match = getTournamentMatch(player.id);
        if (!match) return;

        const side = getPlayerSide(player.id, match);
        if (!side) return;

        match.ready[side] = true;

        if (match.ready.left && match.ready.right) {
            try {
                await gameRepository.start(match.gameId);
                startTournamentGameLoop(match.gameId);
            } catch (err) {
            }
        }
    }
}


function handlePlayAgain(userId: number): void {
    const player = getPlayer(userId);
    if (!player)
        return;

    const { socket } = player;

    cleanupPlayer(userId);
    handleRemoteGame(userId, socket!);
}

export const handleMessage = (userId: number, data: ClientMessage, socket: WebSocket): void => {

    if (data.type === "remote") {
        handleRemoteGame(userId, socket);
        return;
    }

    if (data.type === "tournament") {
        handleTournamentGame(data, userId, socket);
        return;
    }

    if (data.type === "ready") {
        handleReady(userId);
        return;
    }

    if (data.type === "move") {
        handleMove(userId, data);
        return;
    }

    if (data.type === "playAgain") {
        handlePlayAgain(userId);
        return;
    }

    if (data.type === "leaveGame") {
        cleanupPlayer(userId);
        return;
    }
};

export function removePlayer(userId: number): void {
    cleanupPlayer(userId);
    players.delete(userId);
}

