import db from "../../db/db";
import gameRepository from './gameRepository';
import {
    Tournament,
    TournamentList,
    TournamentPlayer,
    BracketMatch,
    UserMatch,
    TournamentOverview,
    TournamentBasic,
    Champion
} from "../types/tournament.types";

import {
    notifyPlayerMatchReady,
    notifyTournamentStarted

} from '../notification.service';

const tournamentRepository = {

    create: async (name: string, max_players: number, created_by: number, start_time?: string): Promise<number> => {
        const result = await db.run(
            `INSERT INTO tournaments 
            (name, max_players, created_by, status, current_round, start_time, created_at) 
         VALUES (?, ?, ?, 'registration', 1, ?, CURRENT_TIMESTAMP)`,
            [name, max_players, created_by, start_time || null]
        );
        return result.lastID;
    },

    async getTournaments(): Promise<TournamentList[]> {
        const rows = await db.all<TournamentList>(
            `SELECT 
            id,
            name,
            start_time,
            max_players,
            status,
            created_at
        FROM tournaments
        WHERE status != 'finished'
        ORDER BY created_at DESC`
        );
        return rows;
    },

    async register(tournamentId: number, userId: number): Promise<void> {
        await db.run(
            `INSERT INTO tournament_players (tournament_id, user_id) VALUES (?, ?)`,
            [tournamentId, userId]
        );
    },

    async findById(id: number): Promise<Tournament | null> {
        const tournament = await db.get(
            `SELECT * FROM tournaments WHERE id = ?`,
            [id]
        );
        return (tournament as Tournament) || null;
    },

    async getChampion(tournamentId: number): Promise<Champion | null> {
        const champion = await db.get<Champion>(
            `SELECT
            u.id,
            u.username,
            (u.image_src || u.profile_picture) AS profile_picture
        FROM tournaments t
        JOIN users u ON u.id = t.winner_id
        WHERE t.id = ?
          AND t.status = 'finished'
          AND t.winner_id IS NOT NULL`,
            [tournamentId]);
        return champion ?? null;
    },

    async getPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        const players = await db.all<TournamentPlayer>(
            `SELECT 
            tp.id,
            tp.user_id,
            tp.registered_at,
            u.username,
            (u.image_src || u.profile_picture) AS profile_picture
         FROM tournament_players tp
         JOIN users u ON tp.user_id = u.id
         WHERE tp.tournament_id = ?
         ORDER BY tp.registered_at ASC`,
            [tournamentId]
        );
        return players;
    },

    async getUserMatch(tournamentId: number, playerId: number): Promise<UserMatch | null> {
        const match = await db.get<UserMatch>(
            `SELECT 
        id,
        round,
        match_number,
        status
     FROM tournament_matches
     WHERE tournament_id = ?
       AND (player1_id = ? OR player2_id = ?)
       AND status = 'pending'
     ORDER BY round ASC, match_number ASC
     LIMIT 1`,
            [tournamentId, playerId, playerId]
        );

        return match ?? null;
    },

    async updateStatus(tournamentId: number, status: string): Promise<void> {
        await db.run(
            `UPDATE tournaments SET status = ? WHERE id = ?`,
            [status, tournamentId]
        );
    },

    async getTournamentName(tournamentId: number): Promise<string | null> {
        const row = await db.get<{ name: string }>(
            `SELECT name FROM tournaments WHERE id = ?`,
            [tournamentId]
        );
        return row?.name || null;
    },

    async start(tournamentId: number): Promise<void> {
        notifyTournamentStarted(tournamentId, (await this.getTournamentName(tournamentId))!);
        const players = await this.getPlayers(tournamentId);

        const matchesCount = players.length / 2;

        for (let i = 0; i < matchesCount; i++) {
            const player1 = players[i];
            const player2 = players[i + matchesCount];

            const gameId = await gameRepository.createGame('tournament');

            // Add players to the game
            await gameRepository.addPlayer(gameId, player1.user_id, 1);
            await gameRepository.addPlayer(gameId, player2.user_id, 2);

            notifyPlayerMatchReady(player1.user_id, tournamentId, gameId);
            notifyPlayerMatchReady(player2.user_id, tournamentId, gameId);

            // Insert match using tournament_players.id, NOT user_id
            await db.run(
                `INSERT INTO tournament_matches
                (tournament_id, round, match_number, player1_id, player2_id, game_id, status)
                VALUES (?, 1, ?, ?, ?, ?, 'pending')`,
                [tournamentId, i + 1, player1.user_id, player2.user_id, gameId]
            );
        }

        await this.updateStatus(tournamentId, 'active');
    },

    async getOverview(tournamentId: number): Promise<TournamentOverview | null> {
        const tournament = await db.get<Tournament>(
            `SELECT 
            t.*,
            creator.username AS creator_username,
            creator.display_name AS creator_display_name,
            winner.username AS winner_username
        FROM tournaments t
        JOIN users creator ON t.created_by = creator.id
        LEFT JOIN users winner ON t.winner_id = winner.id
        WHERE t.id = ?`,
            [tournamentId]
        );
        return tournament || null;
    },


    async getTournament(tournamentId: number, userId: number): Promise<TournamentBasic | null> {
        const tournament = await db.get<TournamentBasic>(
            `SELECT id, name, status FROM tournaments WHERE id = ?`,
            [tournamentId]
        );

        if (!tournament)
            return null;

        const regRow = await db.get<{ user_id: number }>(
            `SELECT user_id FROM tournament_players WHERE tournament_id = ? AND user_id = ?`,
            [tournamentId, userId]
        );

        return {
            id: tournament.id,
            name: tournament.name,
            status: tournament.status,
            is_registered: !!regRow
        };
    },


    async getBracket(tournamentId: number): Promise<BracketMatch[]> {
        return db.all<BracketMatch>(
            `
        SELECT
            tm.id,
            tm.round,
            tm.match_number AS matchNumber,
            u1.username AS player1Username,
            u2.username AS player2Username,
            uw.username AS winnerUsername,
            tm.game_id AS gameId,
            tm.status
        FROM tournament_matches tm
        LEFT JOIN users u1 ON tm.player1_id = u1.id
        LEFT JOIN users u2 ON tm.player2_id = u2.id
        LEFT JOIN users uw ON tm.winner_id = uw.id
        WHERE tm.tournament_id = ?
        ORDER BY tm.round, tm.match_number
        `,
            [tournamentId]
        );
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
    },

    async areAllMatchesCompleted(tournamentId: number): Promise<boolean> {
        const row = await db.get(
            `
        SELECT 1
        FROM tournament_matches
        WHERE tournament_id = ?
          AND round = ( SELECT current_round FROM tournaments WHERE id = ?)
          AND status != 'completed' LIMIT 1 `,
            [tournamentId, tournamentId]
        );
        return !row;
    },

    async finishTournament(tournamentId: number, championId: number) {
        const champion = await db.get<{ username: string }>(
            `SELECT username FROM users WHERE id = ?`,
            [championId]
        );

        await db.run(
            `UPDATE tournaments SET status = 'finished', winner_id = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [championId, tournamentId]
        );
    },


    async createNextRoundMatches(tournamentId: number, winners: number[], nextRound: number) {
        for (let i = 0; i < winners.length; i += 2) {
            const p1 = winners[i];
            const p2 = winners[i + 1];
            if (!p2)
                continue;

            const gameId = await gameRepository.createGame("tournament");

            await gameRepository.addPlayer(gameId, p1, 1);
            await gameRepository.addPlayer(gameId, p2, 2);
            notifyPlayerMatchReady(p1, tournamentId, gameId);
            notifyPlayerMatchReady(p2, tournamentId, gameId);

            const matchResult = await db.run(
                `INSERT INTO tournament_matches
                (tournament_id, round, match_number, player1_id, player2_id, game_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
                [tournamentId, nextRound, i / 2 + 1, p1, p2, gameId]
            );
            notifyPlayerMatchReady(p1, tournamentId, matchResult.lastID);
            notifyPlayerMatchReady(p2, tournamentId, matchResult.lastID);
        }
    },


    async advanceRound(tournamentId: number) {
        const currentRound = await this.getCurrentRound(tournamentId);
        const matches = await this.getMatches(tournamentId, currentRound);
        if (matches.length === 0)
            return;

        if (matches.length === 1) {
            await this.finishTournament(tournamentId, matches[0].winner_id);
            return;
        }

        const nextRound = currentRound + 1;
        const winners = matches.map(m => m.winner_id);
        await this.createNextRoundMatches(tournamentId, winners, nextRound);

        await db.run(`UPDATE tournaments SET current_round = ? WHERE id = ?`, [nextRound, tournamentId]);
    },


    async getTournamentMatchDetails(tournamentId: number, matchId: number) {
        const matchData = await db.get(`
        SELECT 
            m.id,
            m.round,
            m.match_number,
            m.status,
            m.game_id,
            m.created_at,

            -- player 1
            u1.id        AS player1_user_id,
            u1.username  AS player1_username,
            COALESCE(u1.profile_picture, u1.image_src) AS player1_avatar,

            -- player 2
            u2.id        AS player2_user_id,
            u2.username  AS player2_username,
            COALESCE(u2.profile_picture, u2.image_src) AS player2_avatar

        FROM tournament_matches m
        LEFT JOIN users u1 ON m.player1_id = u1.id
        LEFT JOIN users u2 ON m.player2_id = u2.id

        WHERE m.id = ? AND m.tournament_id = ?
    `, [matchId, tournamentId]);
        return matchData ?? null;
    },

    async updateMatchStatus(matchId: number, status: string) {
        await db.run(
            `UPDATE tournament_matches SET status = ?  WHERE id = ?`,
            [status, matchId]
        );
    },

    async updateMatchWinner(tournamentId: number, matchId: number, winnerUserId: number) {
        await db.run(
            `UPDATE tournament_matches
            SET winner_id = ?, status = 'completed'
            WHERE id = ? AND tournament_id = ?`,
            [winnerUserId, matchId, tournamentId]
        );
    },


    //------------------------------------------------------------------------

    async isRegistrationOpen(tournamentId: number): Promise<boolean> {
        const tournament = await db.get<{ status: string }>(
            `SELECT status FROM tournaments WHERE id = ?`,
            [tournamentId]
        );
        return tournament?.status === 'registration';
    },

    async tournamentExists(tournamentId: number): Promise<boolean> {
        const tournament = await db.get<{ id: number }>(
            `SELECT id FROM tournaments WHERE id = ?`,
            [tournamentId]
        );
        return !!tournament;
    },

    async playerCount(tournamentId: number): Promise<number> {
        const row = await db.get<{ count: number }>(
            `SELECT COUNT(*) AS count FROM tournament_players WHERE tournament_id = ?`,
            [tournamentId]
        );
        return row?.count ?? 0;
    },

    async maxPlayers(tournamentId: number): Promise<number> {
        const row = await db.get<{ max_players: number }>(
            `SELECT max_players FROM tournaments WHERE id = ?`,
            [tournamentId]
        );
        return row?.max_players ?? 0;
    },

    async isAlreadyRegistered(tournamentId: number, userId: number): Promise<boolean> {
        const exists = await db.get(
            `SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?`,
            [tournamentId, userId]
        );
        return !!exists;
    },

    async getCurrentRound(tournamentId: number): Promise<number> {
        const row = await db.get<{ current_round: number }>(
            `SELECT current_round FROM tournaments WHERE id = ?`,
            [tournamentId]
        );
        return row?.current_round || 1;
    },

    async getMatches(tournamentId: number, round: number) {
        return db.all<{ id: number; winner_id: number }>(
            `SELECT id, winner_id FROM tournament_matches WHERE tournament_id = ? AND round = ?`,
            [tournamentId, round]
        );
    },
};

export default tournamentRepository;
