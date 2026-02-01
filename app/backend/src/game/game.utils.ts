import {Player} from './game.types';
import {Paddle, Canvas } from './game.config';
import gameRepository from '../repository/gameRepository';
import { TournamentMatch, Match, Side, BadgeCheckStats } from './game.types';
import { getPlayer } from './game.server';
import { getRemoteMatch } from './game.remote';
import { getTournamentMatch } from './game.tournament';


const XP_RULES = {
    WIN: 100,
    LOSS: 30,
    PER_POINT: 5,
    XP_PER_LEVEL: 1000,
};

export interface PlayerStats {
    wins: number;
    losses: number;
    level: number;
    total_xp: number;
    games_played: number;
    win_rate: number;
}

export function sendMessage(player: Player | undefined, message: object): void {
    if (player?.socket?.readyState === WebSocket.OPEN) {
        player.socket.send(JSON.stringify(message));
    }
}

export function updatePaddle( paddle: { y: number } | undefined, keys: { up: boolean; down: boolean }): void {
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

export function handleMove(userId: number, data: { up:  boolean; down: boolean }): void {
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
        const players = await gameRepository.getPlayers(match.gameId);
        if (!players || players.length !== 2) {
            throw new Error("Game must have exactly two players");
        }

        const [p1, p2] = players;
        if (!p1.user_id || !p2.user_id) {
            throw new Error("Both players must be users");
        }

        const loserId = p1.user_id === winnerId ? p2.user_id : p1.user_id;

        const winnerPlayer = p1.user_id === winnerId ? p1 : p2;
        const loserPlayer = p1.user_id === loserId ? p1 : p2;

        const winnerScore = winnerPlayer.score ?? 0;
        const loserScore = loserPlayer.score ?? 0;

        const [winnerStats, loserStats] = await Promise.all([
            gameRepository.getPlayerStats(winnerId),
            gameRepository.getPlayerStats(loserId),
        ]);

        const winnerXpGain = XP_RULES.WIN + winnerScore * XP_RULES.PER_POINT;
        const loserXpGain = XP_RULES.LOSS + loserScore * XP_RULES.PER_POINT;

        const winnerTotalXp = (winnerStats?.total_xp ?? 0) + winnerXpGain;
        const loserTotalXp = (loserStats?.total_xp ?? 0) + loserXpGain;

        const winnerLevel = winnerTotalXp / XP_RULES.XP_PER_LEVEL;
        const loserLevel = loserTotalXp / XP_RULES.XP_PER_LEVEL;

        await Promise.all([
            gameRepository.updatePlayerStats(
                winnerId,
                winnerTotalXp,
                winnerLevel,
                (winnerStats?.wins ?? 0) + 1,
                winnerStats?.losses ?? 0,
                (winnerStats?.games_played ?? 0) + 1
            ),
            gameRepository.updatePlayerStats(
                loserId,
                loserTotalXp,
                loserLevel,
                loserStats?.wins ?? 0,
                (loserStats?.losses ?? 0) + 1,
                (loserStats?.games_played ?? 0) + 1
            ),
        ]);

        await Promise.all([
            checkAndAwardBadges(winnerId, winnerTotalXp),
            checkAndAwardBadges(loserId, loserTotalXp),
        ]);
    } catch (error) {
        console.error("Player progress update failed:", error);
    }
}


async function awardBadge(userId: number, badgeName:  string, badgeIcon: string): Promise<void> {
    try {
        const currentBadge = await gameRepository.getUserBadge(userId);
        if (!currentBadge || currentBadge.badge_name !== badgeName) {
            await gameRepository.upsertBadge(userId, badgeName, badgeIcon);
        }
    } catch (err) {
        console.error(`Failed to update badge for user ${userId}: `, err);
    }
}

export async function checkAndAwardBadges(userId: number, totalXP: number): Promise<void> {
    if (totalXP >= 50000) {
        await awardBadge(userId, 'Master', '👑');
    } else if (totalXP >= 20000) {
        await awardBadge(userId, 'Platinum', '💎');
    } else if (totalXP >= 10000) {
        await awardBadge(userId, 'Gold', '🥇');
    } else if (totalXP >= 5000) {
        await awardBadge(userId, 'Silver', '🥈');
    } else if (totalXP >= 100) {
        await awardBadge(userId, 'Bronze', '🥉');
    }
}
