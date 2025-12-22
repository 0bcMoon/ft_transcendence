import db from "../../db/db";
import type { ArenaMode, ArenaGameDetail, ArenaGamePlayerDetail } from "./arena.types";

type PlayerInsert = { user_id: number | null; position: 1 | 2; is_ai?: boolean };

const arenaRepository = {
  async createGame(mode: ArenaMode): Promise<number> {
    const res = await db.run(
      `INSERT INTO arena_games (mode, status, created_at) VALUES (?, 'waiting', CURRENT_TIMESTAMP)`,
      [mode]
    );
    const id = res.lastID as number;
    if (!id) throw new Error("Failed to create arena game");
    return id;
  },

  async addPlayers(arenaGameId: number, players: PlayerInsert[]) {
    for (const p of players) {
      await db.run(
        `INSERT INTO arena_game_players (arena_game_id, user_id, position, score, is_ai)
         VALUES (?, ?, ?, 0, ?)`,
        [arenaGameId, p.user_id ?? null, p.position, p.is_ai ? 1 : 0]
      );
    }
  },

  async start(arenaGameId: number) {
    await db.run(
      `UPDATE arena_games SET status='playing', started_at=CURRENT_TIMESTAMP WHERE id=?`,
      [arenaGameId]
    );
  },

  async updatePlayerScore(arenaGameId: number, position: 1 | 2, score: number) {
    await db.run(
      `UPDATE arena_game_players SET score=? WHERE arena_game_id=? AND position=?`,
      [score, arenaGameId, position]
    );
  },

  async finish(arenaGameId: number, winnerUserId: number | null) {
    await db.run(
      `UPDATE arena_games SET status='finished', winner_user_id=?, ended_at=CURRENT_TIMESTAMP WHERE id=?`,
      [winnerUserId, arenaGameId]
    );
  },

  async cancel(arenaGameId: number) {
    await db.run(
      `UPDATE arena_games SET status='cancelled', ended_at=CURRENT_TIMESTAMP WHERE id=?`,
      [arenaGameId]
    );
  },

  async getGameDetail(arenaGameId: number): Promise<ArenaGameDetail | undefined> {
    return await db.get<ArenaGameDetail>(
      `SELECT id, mode, status, winner_user_id, started_at, ended_at, created_at
       FROM arena_games WHERE id=?`,
      [arenaGameId]
    );
  },

  async getGamePlayers(arenaGameId: number): Promise<ArenaGamePlayerDetail[]> {
    const rows = await db.all<{
      position: number;
      user_id: number | null;
      username: string | null;
      display_name: string | null;
      profile_picture: string | null;
      image_src: string | null;
      score: number | null;
      is_ai: number;
      joined_at: string;
    }>(
      `SELECT
        ap.position,
        ap.user_id,
        u.username,
        u.display_name,
        u.profile_picture,
        u.image_src,
        ap.score,
        ap.is_ai,
        ap.joined_at
       FROM arena_game_players ap
       LEFT JOIN users u ON ap.user_id = u.id
       WHERE ap.arena_game_id = ?
       ORDER BY ap.position ASC`,
      [arenaGameId]
    );

    return rows.map(r => ({
      position: r.position,
      user_id: r.user_id,
      username: r.username,
      display_name: r.display_name,
      profile_picture: r.profile_picture,
      image_src: r.image_src,
      score: r.score,
      is_ai: !!r.is_ai,
      joined_at: r.joined_at,
    }));
  },

  async getRecentGlobal(limit = 20) {
    // simple: last finished games with player info
    const rows = await db.all<any>(
      `SELECT
        g.id as arena_game_id,
        g.mode,
        g.winner_user_id,
        g.ended_at,
        g.created_at,

        p1.user_id AS player1_id,
        p1.score AS player1_score,
        u1.username AS player1_name,
        u1.profile_picture AS player1_avatar,

        p2.user_id AS player2_id,
        p2.score AS player2_score,
        u2.username AS player2_name,
        u2.profile_picture AS player2_avatar

      FROM arena_games g
      JOIN arena_game_players p1 ON g.id = p1.arena_game_id AND p1.position = 1
      JOIN arena_game_players p2 ON g.id = p2.arena_game_id AND p2.position = 2
      LEFT JOIN users u1 ON p1.user_id = u1.id
      LEFT JOIN users u2 ON p2.user_id = u2.id
      WHERE g.status='finished'
      ORDER BY COALESCE(g.ended_at, g.created_at) DESC
      LIMIT ?`,
      [limit]
    );
    return rows;
  },

  async getUserHistory(userId: number, limit = 50) {
    const rows = await db.all<any>(
      `SELECT
        g.id as matchId,
        g.mode,
        g.ended_at as date,
        (g.winner_user_id = p_self.user_id) as isWin,
        p_self.score as user_score,
        p_opp.score as opponent_score,
        u_opp.username as opponent_name,
        u_opp.profile_picture as opponent_avatar
      FROM arena_game_players p_self
      JOIN arena_games g ON g.id = p_self.arena_game_id
      LEFT JOIN arena_game_players p_opp
        ON p_opp.arena_game_id = p_self.arena_game_id
        AND p_opp.id != p_self.id
      LEFT JOIN users u_opp ON u_opp.id = p_opp.user_id
      WHERE p_self.user_id = ?
        AND g.status='finished'
      ORDER BY COALESCE(g.ended_at, g.created_at) DESC
      LIMIT ?`,
      [userId, limit]
    );
    return rows;
  },
};

export default arenaRepository;
