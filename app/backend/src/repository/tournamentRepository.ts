// src/repository/tournamentRepository.ts

import db from "../../db/db";
import { notifyUsers, IEvent } from '../notifications';
import gameRepository from './gameRepository';
import {
    Tournament,
    TournamentStatus,
    TournamentPlayer,
    TournamentMatch,
    TournamentDetails,
    CreateTournamentData,
    BracketRound,
    BracketMatch,
    TournamentMatchWithPlayers,
} from "../types/tournament.types";

/**
 * Get round name based on position
 */
function getRoundName(round: number, totalRounds: number): string {
    const roundsFromEnd = totalRounds - round;

    if (roundsFromEnd === 0) return 'Finals';
    if (roundsFromEnd === 1) return 'Semi-Finals';
    if (roundsFromEnd === 2) return 'Quarter-Finals';
    if (roundsFromEnd === 3) return 'Round of 16';
    if (roundsFromEnd === 4) return 'Round of 32';

    return `Round ${round}`;
}

const tournamentRepository = {
    async create(data: CreateTournamentData): Promise<number> {
        const result = await db.run(
            `INSERT INTO tournaments (name, max_players, created_by, status, current_round, created_at) 
             VALUES (?, ?, ?, 'registration', 1, CURRENT_TIMESTAMP)`,
            [data.name, data.max_players, data.created_by]
        );

        if (!result.lastID) {
            throw new Error("Failed to create tournament");
        }

        return result.lastID;
    },

    async findById(id: number): Promise<Tournament | null> {
        const tournament = await db.get(
            `SELECT * FROM tournaments WHERE id = ?`,
            [id]
        );
        return (tournament as Tournament) || null;
    },

    async findAll(): Promise<Tournament[]> {
        const tournaments = await db.all(
            `SELECT * FROM tournaments ORDER BY created_at DESC`
        );
        return tournaments as Tournament[];
    },

    async getDetails(tournamentId: number, currentUserId?: number): Promise<TournamentDetails | null> {
        const tournament = await db.get(
            `SELECT 
                t.*,
                u.id as creator_id,
                u.username as creator_username,
                (SELECT COUNT(*) FROM tournament_players WHERE tournament_id = t.id) as player_count
             FROM tournaments t
             LEFT JOIN users u ON t.created_by = u.id
             WHERE t.id = ?`,
            [tournamentId]
        ) as any;

        if (!tournament) return null;

        let isRegistered = false;
        if (currentUserId) {
            const check = await db.get(
                `SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?`,
                [tournamentId, currentUserId]
            );
            isRegistered = !!check;
        }

        return {
            id: tournament.id,
            name: tournament.name,
            status: tournament.status,
            created_by: tournament.created_by,
            winner_id: tournament.winner_id,
            max_players: tournament.max_players,
            current_round: tournament.current_round,
            started_at: tournament.started_at,
            ended_at: tournament.ended_at,
            created_at: tournament.created_at,
            creator: {
                id: tournament.creator_id,
                username: tournament.creator_username,
            },
            players: [],
            player_count: tournament.player_count,
            is_registered: isRegistered,
            can_start: tournament.status === 'registration' &&
                tournament.player_count === tournament.max_players,
        };
    },

    async getPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const players = await db.all(
            `SELECT 
                tp.id,
                tp.tournament_id,
                tp.user_id,
                tp.seed,
                tp.eliminated,
                tp.registered_at,
                u.username,
                u.profile_picture
             FROM tournament_players tp
             JOIN users u ON tp.user_id = u.id
             WHERE tp.tournament_id = ? 
             ORDER BY tp.seed ASC`,
            [tournamentId]
        );

        return players as TournamentPlayer[];
    },

    async registerPlayer(tournamentId: number, userId: number): Promise<void> {
        const tournament = await this.findById(tournamentId);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status !== 'registration') throw new Error("Registration is closed");

        const existing = await db.get(
            `SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?`,
            [tournamentId, userId]
        );
        if (existing) throw new Error("Already registered for this tournament");

        const count = await db.get(
            `SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = ?`,
            [tournamentId]
        ) as any;

        const currentCount = count?.count || 0;

        if (currentCount >= tournament.max_players) {
            throw new Error("Tournament is full");
        }

        const seed = currentCount + 1;

        // Register player
        await db.run(
            `INSERT INTO tournament_players (tournament_id, user_id, seed, eliminated, registered_at) 
             VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)`,
            [tournamentId, userId, seed]
        );


        if (seed === tournament.max_players) {

            const players = await this.getPlayers(tournamentId);
            const playerUserIds = players.map(p => p.user_id);

            // Notify all players tournament is full
            const fullEvent: IEvent = {
                type: 'tournament_full',
                tournament: {
                    id: tournamentId,
                    name: tournament.name,
                }
            };
            notifyUsers(playerUserIds, fullEvent);

            // Auto-start after 5 seconds
            setTimeout(async () => {
                try {
                    const tournamentCheck = await this.findById(tournamentId);
                    if (tournamentCheck && tournamentCheck.status === 'registration') {
                        await this.start(tournamentId);
                    }
                } catch (error: any) {
                }
            }, 5000);
        }
    },

    async start(tournamentId: number): Promise<void> {
        const tournament = await this.findById(tournamentId);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status !== 'registration') throw new Error("Tournament already started");

        const players = await this.getPlayers(tournamentId);
        if (players.length !== tournament.max_players) {
            throw new Error(`Tournament must be full (${players.length}/${tournament.max_players})`);
        }

        const validSizes = [4, 8, 16, 32, 64];
        if (!validSizes.includes(players.length)) {
            throw new Error("Number of players must be 4, 8, 16, 32, or 64");
        }


        const numMatches = players.length / 2;
        const firstRoundMatches: Array<{
            matchId: number;
            player1: TournamentPlayer;
            player2: TournamentPlayer;
            gameId: number;
        }> = [];

        for (let i = 0; i < numMatches; i++) {
            const player1 = players[i];
            const player2 = players[players.length - 1 - i];

            const gameId = await gameRepository.createGameAndAddPlayers('tournament', [
                { user_id: player1.user_id, position: 1 },
                { user_id: player2.user_id, position: 2 }
            ]);

            const matchResult = await db.run(
                `INSERT INTO tournament_matches 
                 (tournament_id, round, match_number, player1_id, player2_id, game_id, status, created_at) 
                 VALUES (?, 1, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
                [tournamentId, i + 1, player1.id, player2.id, gameId]
            );

            if (!matchResult.lastID) {
                throw new Error("Failed to create tournament match");
            }

            console.log(`   Match ${i + 1}: ${player1.username} vs ${player2.username} → Game ${gameId}`);

            firstRoundMatches.push({
                matchId: matchResult.lastID,
                player1,
                player2,
                gameId
            });
        }

        await db.run(
            `UPDATE tournaments 
             SET status = 'active', started_at = CURRENT_TIMESTAMP, current_round = 1 
             WHERE id = ?`,
            [tournamentId]
        );


        const playerUserIds = players.map(p => p.user_id);
        const startEvent: IEvent = {
            type: 'tournament_started',
            tournament: {
                id: tournamentId,
                name: tournament.name,
            }
        };
        notifyUsers(playerUserIds, startEvent);

        // Notify each player about their specific match
        for (let i = 0; i < firstRoundMatches.length; i++) {
            const match = firstRoundMatches[i];

            const matchReadyEvent: IEvent = {
                type: 'match_ready',
                tournament: {
                    id: tournamentId,
                    name: tournament.name,
                },
                match: {
                    id: match.matchId,
                    round: 1,
                    matchNumber: i + 1,
                }
            };

            notifyUsers([match.player1.user_id, match.player2.user_id], matchReadyEvent);

            console.log(`📢 Notified players for match ${match.matchId}:  ${match.player1.username} & ${match.player2.username}`);
        }
    },

    async getBracket(tournamentId: number): Promise<{ rounds: BracketRound[]; champion?: any } | null> {
        const tournament = await this.findById(tournamentId);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status === 'registration') return null;

        const matches = await db.all(
            `SELECT 
                m.*,
                p1.id as player1_id,
                p1.seed as player1_seed,
                u1.username as player1_username,
                p2.id as player2_id,
                p2.seed as player2_seed,
                u2.username as player2_username,
                w.id as winner_player_id,
                uw. username as winner_username
             FROM tournament_matches m
             LEFT JOIN tournament_players p1 ON m.player1_id = p1.id
             LEFT JOIN users u1 ON p1.user_id = u1.id
             LEFT JOIN tournament_players p2 ON m.player2_id = p2.id
             LEFT JOIN users u2 ON p2.user_id = u2.id
             LEFT JOIN tournament_players w ON m.winner_id = w.id
             LEFT JOIN users uw ON w.user_id = uw.id
             WHERE m.tournament_id = ? 
             ORDER BY m.round, m.match_number`,
            [tournamentId]
        ) as any[];

        if (matches.length === 0) return null;

        const maxRound = Math.max(...matches.map(m => m.round));
        const rounds: BracketRound[] = [];

        for (let r = 1; r <= maxRound; r++) {
            const roundMatches = matches.filter(m => m.round === r);
            const roundName = getRoundName(r, maxRound);

            rounds.push({
                round: r,
                name: roundName,
                matches: roundMatches.map(m => ({
                    id: m.id,
                    tournament_id: m.tournament_id,
                    round: m.round,
                    match_number: m.match_number,
                    status: m.status,
                    player1: m.player1_id ? {
                        id: m.player1_id,
                        username: m.player1_username,
                        seed: m.player1_seed
                    } : undefined,
                    player2: m.player2_id ? {
                        id: m.player2_id,
                        username: m.player2_username,
                        seed: m.player2_seed
                    } : undefined,
                    winner: m.winner_player_id ? {
                        id: m.winner_player_id,
                        username: m.winner_username
                    } : undefined,
                    game_id: m.game_id,
                    scheduled_at: m.scheduled_at,
                    completed_at: m.completed_at,
                    created_at: m.created_at,
                }))
            });
        }

        let champion = undefined;
        if (tournament.status === 'finished' && tournament.winner_id) {
            const championUser = await db.get(
                `SELECT u.id, u.username 
                 FROM users u
                 WHERE u.id = ?`,
                [tournament.winner_id]
            ) as any;

            if (championUser) {
                champion = {
                    id: championUser.id,
                    username: championUser.username,
                };
            }
        }

        return { rounds, champion };
    },

    async cancel(tournamentId: number): Promise<void> {
        const tournament = await this.findById(tournamentId);
        if (!tournament) throw new Error("Tournament not found");

        if (tournament.status === 'finished') {
            throw new Error("Cannot cancel a finished tournament");
        }

        if (tournament.status === 'cancelled') {
            throw new Error("Tournament is already cancelled");
        }

        await db.run(
            `UPDATE tournaments 
             SET status = 'cancelled', ended_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [tournamentId]
        );

        console.log(`❌ Tournament ${tournamentId} cancelled`);
    },

    async advanceRound(tournamentId: number): Promise<void> {
        const tournament = await this.findById(tournamentId);
        if (!tournament) throw new Error("Tournament not found");
        if (tournament.status !== 'active') throw new Error("Tournament is not active");

        const currentRound = tournament.current_round;

        const currentMatches = await db.all(
            `SELECT * FROM tournament_matches 
             WHERE tournament_id = ? AND round = ?`,
            [tournamentId, currentRound]
        ) as TournamentMatch[];

        const allCompleted = currentMatches.every(m => m.status === 'completed' && m.winner_id);

        if (!allCompleted) {
            throw new Error("Not all matches in current round are completed");
        }

        if (currentMatches.length === 1) {
            const finalMatch = currentMatches[0];

            const winnerPlayer = await db.get(
                `SELECT tp.user_id, u.username
                 FROM tournament_players tp
                 JOIN users u ON tp. user_id = u.id
                 WHERE tp.id = ?`,
                [finalMatch.winner_id]
            ) as any;

            if (!winnerPlayer) {
                throw new Error("Winner player not found");
            }

            await db.run(
                `UPDATE tournaments 
                 SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [winnerPlayer.user_id, tournamentId]
            );


            const players = await this.getPlayers(tournamentId);
            const playerUserIds = players.map(p => p.user_id);

            const finishedEvent: IEvent = {
                type: 'tournament_finished',
                tournament: {
                    id: tournamentId,
                    name: tournament.name,
                },
                champion: {
                    id: winnerPlayer.user_id,
                    username: winnerPlayer.username,
                }
            };

            notifyUsers(playerUserIds, finishedEvent);


            return;
        }

        const nextRound = currentRound + 1;
        const winners = currentMatches.map(m => m.winner_id).filter(Boolean); // ✅ Filter out null/undefined
        const nextRoundMatches: Array<{
            matchId: number;
            player1UserId: number;
            player2UserId: number;
        }> = [];

        for (let i = 0; i < winners.length; i += 2) {
            const player1_id = winners[i];
            const player2_id = winners[i + 1];

            if (!player1_id || !player2_id) {
                continue;
            }

            const p1 = await db.get(
                `SELECT user_id FROM tournament_players WHERE id = ?`,
                [player1_id]
            ) as any;

            const p2 = await db.get(
                `SELECT user_id FROM tournament_players WHERE id = ?`,
                [player2_id]
            ) as any;

            if (!p1 || !p2) {
                continue;
            }

            const gameId = await gameRepository.createGameAndAddPlayers('tournament', [
                { user_id: p1.user_id, position: 1 },
                { user_id: p2.user_id, position: 2 }
            ]);

            const matchResult = await db.run(
                `INSERT INTO tournament_matches 
                 (tournament_id, round, match_number, player1_id, player2_id, game_id, status, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
                [tournamentId, nextRound, Math.floor(i / 2) + 1, player1_id, player2_id, gameId]
            );

            if (!matchResult.lastID) {
                throw new Error("Failed to create next round match");
            }

            nextRoundMatches.push({
                matchId: matchResult.lastID,
                player1UserId: p1.user_id,
                player2UserId: p2.user_id,
            });

            console.log(`   Round ${nextRound} Match ${Math.floor(i / 2) + 1}: Player ${p1.user_id} vs Player ${p2.user_id} → Game ${gameId}`);
        }

        // Update tournament current round
        await db.run(
            `UPDATE tournaments SET current_round = ? WHERE id = ?`,
            [nextRound, tournamentId]
        );

        console.log(`➡️ Tournament ${tournamentId} advanced to round ${nextRound}`);

        for (let i = 0; i < nextRoundMatches.length; i++) {
            const match = nextRoundMatches[i];

            const matchReadyEvent: IEvent = {
                type: 'match_ready',
                tournament: {
                    id: tournamentId,
                    name: tournament.name,
                },
                match: {
                    id: match.matchId,
                    round: nextRound,
                    matchNumber: i + 1,
                }
            };

            // Notify both players
            notifyUsers([match.player1UserId, match.player2UserId], matchReadyEvent);
        }
    },

    async getUserMatch(tournamentId: number, userId: number): Promise<TournamentMatchWithPlayers | null> {
        const player = await db.get(
            `SELECT id FROM tournament_players 
         WHERE tournament_id = ? AND user_id = ?`,
            [tournamentId, userId]
        ) as any;

        if (!player) return null;

        // Get user's current pending match
        const match = await db.get(
            `SELECT 
            m.*,
            p1.user_id as player1_user_id,
            u1.username as player1_username,
            p2.user_id as player2_user_id,
            u2.username as player2_username
         FROM tournament_matches m
         LEFT JOIN tournament_players p1 ON m.player1_id = p1.id
         LEFT JOIN users u1 ON p1.user_id = u1.id
         LEFT JOIN tournament_players p2 ON m. player2_id = p2.id
         LEFT JOIN users u2 ON p2.user_id = u2.id
         WHERE m.tournament_id = ? 
           AND (m.player1_id = ? OR m.player2_id = ?)
           AND m.status = 'pending'
         ORDER BY m.round ASC, m.match_number ASC
         LIMIT 1`,
            [tournamentId, player.id, player.id]
        ) as any;

        return match || null;
    },
    async getTournamentMatchDetails(tournamentId: number, matchId: number) {
        const matchData = await db.get(
            `SELECT 
                m.*,
                p1.user_id as player1_user_id,
                u1.username as player1_username,
                u1.profile_picture as player1_avatar,
                p2.user_id as player2_user_id,
                u2.username as player2_username,
                u2.profile_picture as player2_avatar
             FROM tournament_matches m
             LEFT JOIN tournament_players p1 ON m. player1_id = p1.id
             LEFT JOIN users u1 ON p1.user_id = u1.id
             LEFT JOIN tournament_players p2 ON m.player2_id = p2.id
             LEFT JOIN users u2 ON p2.user_id = u2.id
             WHERE m.id = ? AND m.tournament_id = ?`,
            [matchId, tournamentId]
        ) as any;

        return matchData;
    },

    async isPlayerInMatch(tournamentId: number, matchId: number, userId: number): Promise<boolean> {
        const matchData = await this.getTournamentMatchDetails(tournamentId, matchId);

        if (!matchData) return false;

        return matchData.player1_user_id === userId || matchData.player2_user_id === userId;
    },

    async updateMatchStatus(matchId: number, status: 'pending' | 'playing' | 'completed'): Promise<void> {
        await db.run(
            `UPDATE tournament_matches SET status = ?  WHERE id = ?`,
            [status, matchId]
        );

    },


    async updateMatchWinner(tournamentId: number, matchId: number, winnerPlayerId: number): Promise<void> {
        await db.run(
            `UPDATE tournament_matches 
             SET winner_id = ?, status = 'completed', completed_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [winnerPlayerId, matchId]
        );

    },
};

export default tournamentRepository;
