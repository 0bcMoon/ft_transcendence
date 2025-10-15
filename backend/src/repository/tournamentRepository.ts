import db from "../../db/db";

export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';
import gameRepository from "./gameRepository"; // adjust path


export interface Tournament {
    id: number;
    name: string;
    status: TournamentStatus;
    winner_id: number | null;
    max_players: number;
    current_round: number;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}

export interface TournamentPlayer {
    id: number;
    tournament_id: number;
    user_id: number;
    alias: string;
    status: 'active' | 'eliminated' | 'winner';
    registered_at: string;
}

export interface BracketPlayer {
    user_id: number | null;
    alias: string | null;
    position: number;
    score: number;
}

export interface BracketMatch {
    game_id: number;
    match_order: number;
    round: number;
    status: string;
    winner_user_id: number | null;
    players: BracketPlayer[];
}

export interface TournamentBracket {
    tournament: Tournament;
    rounds: { round: number; matches: BracketMatch[] }[];
}


const tournamentRepository = {
    async createTournament(name: string, maxPlayers = 8): Promise<number> {
        if (!name.trim()) throw new Error("Tournament name required");
        const result = await db.run(
            `INSERT INTO tournaments (name, max_players, status) VALUES (?, ?, 'registration')`,
            [name, maxPlayers]
        );
        return result.lastID;
    },

    async getTournament(id: number): Promise<Tournament | undefined> {
        return db.get<Tournament>(`SELECT * FROM tournaments WHERE id = ?`, [id]);
    },

    async listTournaments(): Promise<Tournament[]> {
        return db.all<Tournament>(`SELECT * FROM tournaments ORDER BY created_at DESC`);
    },

    async registerPlayer(tournament_id: number, user_id: number, alias: string): Promise<number> {
        const t = await this.getTournament(tournament_id);
        if (!t) throw new Error("Tournament not found");
        if (t.status !== 'registration') throw new Error("Registration closed");

        const row = await db.get<{ cnt: number }>(
            `SELECT COUNT(*) AS cnt FROM tournament_players WHERE tournament_id = ?`,
            [tournament_id]
        );
        const count = row?.cnt ?? 0;
        if (count >= t.max_players) throw new Error("Tournament full");

        const existing = await db.get<{ id: number }>(
            `SELECT id FROM tournament_players WHERE tournament_id = ? AND (user_id = ? OR alias = ?)`,
            [tournament_id, user_id, alias]
        );
        if (existing) throw new Error("User or alias already registered");

        const result = await db.run(
            `INSERT INTO tournament_players (tournament_id, user_id, alias) VALUES (?, ?, ?)`,
            [tournament_id, user_id, alias]
        );
        return result.lastID;
    },

    async startTournament(tournament_id: number): Promise<void> {
        const t = await this.getTournament(tournament_id);
        if (!t) throw new Error("Tournament not found");
        if (t.status !== 'registration') return; // idempotent

        const players = await this.listPlayers(tournament_id);
        if (players.length < 2) throw new Error("Not enough players");
        if (players.length !== t.max_players) throw new Error("All slots not filled");

        await db.run(
            `UPDATE tournaments SET status = 'active', started_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [tournament_id]
        );

        let matchOrder = 1;
        for (let i = 0; i < players.length; i += 2) {
            const p1 = players[i];
            const p2 = players[i + 1];
            if (!p2) continue;
            const gameId = await gameRepository.createGame('tournament');
            await gameRepository.addPlayerToGame(gameId, p1.user_id, 1);
            await gameRepository.addPlayerToGame(gameId, p2.user_id, 2);
            await db.run(
                `INSERT INTO tournament_games (tournament_id, game_id, round, match_order)
         VALUES (?, ?, 1, ?)`,
                [tournament_id, gameId, matchOrder++]
            );
        }
    },

    async listPlayers(tournament_id: number): Promise<TournamentPlayer[]> {
        return db.all<TournamentPlayer>(
            `SELECT * FROM tournament_players WHERE tournament_id = ? ORDER BY id ASC`,
            [tournament_id]
        );
    },
};

export default tournamentRepository;
