import { Player } from './game.types';
import { Paddle, Canvas } from './game.config';
import gameRepository from '../repository/gameRepository';
import { TournamentMatch, Match, Side } from './game.types';
import { getPlayer } from './game.server';
import { getRemoteMatch } from './game.remote';
import { getTournamentMatch } from './game.tournament';


const XP_RULES = {
    WIN: 100,
    LOSS: 30,
    PER_POINT: 5,
    XP_PER_LEVEL: 1000,
};

export function sendMessage(player: Player | undefined, message: Object): boolean {
    if (!player) {
        console.warn('Cannot send message: player is undefined');
        return false;
    }

    if (!player.socket) {
        console.warn(`Cannot send message to player ${player.id}: no socket`);
        return false;
    }

    if (player.socket.readyState !== WebSocket.OPEN) {
        console.warn(
            `Cannot send message to player ${player.id}: socket state is ${player.socket.readyState}`
        );
        return false;
    }

    try {
        player.socket.send(JSON.stringify(message));
        return true;
    } catch (error) {
        console.error(`Failed to send message to player ${player.id}:`, error);
        return false;
    }
}

export function updatePaddle(paddle: { y: number } | undefined, keys: { up: boolean; down: boolean }): void {
    if (!paddle)
        return;

    if (keys.up)
        paddle.y -= Paddle.SPEED;
    if (keys.down)
        paddle.y += Paddle.SPEED;

    paddle.y = Math.max(0, Math.min(Canvas.HEIGHT - Paddle.HEIGHT, paddle.y));
}

export function getPlayerSide(userId: number, match: Match | TournamentMatch): Side | null {
    if (match.players.left?.id === userId)
        return 'left';
    if (match.players.right?.id === userId)
        return 'right';
    return null;
}

export function handleMove(userId: number, data: { up: boolean; down: boolean }): void {
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

        match.keys[side].up = data.up ?? false;
        match.keys[side].down = data.down ?? false;
    }
    else if (player.mode === 'tournament') {
        const match = getTournamentMatch(player.id);
        if (!match)
            return;

        const side = getPlayerSide(player.id, match);
        if (!side)
            return;

        match.keys[side].up = data.up ?? false;
        match.keys[side].down = data.down ?? false;
    }
}

export async function updatePlayerProgress( match: TournamentMatch | Match, winnerId: number): Promise<void> {
    try {
        const playerScores = await gameRepository.getPlayerScores(match.gameId);
        
        if (playerScores.length !== 2) {
            throw new Error("Game must have exactly two players");
        }

        const winnerData = playerScores.find(p => p.user_id === winnerId);
        const loserData = playerScores.find(p => p.user_id !== winnerId);

        if (!winnerData || !loserData) {
            throw new Error("Winner not found in game");
        }

        const loserId = loserData.user_id;
        const winnerXpGain = XP_RULES.WIN + winnerData.score * XP_RULES.PER_POINT;
        const loserXpGain = XP_RULES.LOSS + loserData.score * XP_RULES.PER_POINT;

        await Promise.all([
            gameRepository.updateStats(winnerId, winnerXpGain, true),
            gameRepository.updateStats(loserId, loserXpGain, false),

            gameRepository.updatePlayerXpGained(match.gameId, winnerId, winnerXpGain),
            gameRepository.updatePlayerXpGained(match.gameId, loserId, loserXpGain),
        ]);

        const winnerXp = await gameRepository.getTotalXP(winnerId);
        const loserXp = await gameRepository.getTotalXP(loserId);

        await Promise.all([
            checkAndAwardBadges(winnerId, winnerXp),
            checkAndAwardBadges(loserId, loserXp),
        ]);

    } catch (error) {
        console.error("Player progress update failed:", error);
        throw error;
    }
}

export async function checkAndAwardBadges(userId: number, totalXP: number): Promise<void> {
    if (totalXP >= 50000) {
        await gameRepository.upsertBadge(userId, 'Master', '👑');
    } else if (totalXP >= 20000) {
        await gameRepository.upsertBadge(userId, 'Platinum', '💎');
    } else if (totalXP >= 10000) {
        await gameRepository.upsertBadge(userId, 'Gold', '🥇');
    } else if (totalXP >= 5000) {
        await gameRepository.upsertBadge(userId, 'Silver', '🥈');
    } else if (totalXP >= 100) {
        await gameRepository.upsertBadge(userId, 'Bronze', '🥉');
    }
}
