import db from "../../../db/db";
import { ArenaGameDetail, ArenaGamePlayerDetail, ArenaGameStatus } from "../types/arena.types";

type PlayerInput = { user_id: number | null; position: 1 | 2; is_ai?: boolean };

const arenaRepository = {
  async getUserStats(userId: number) {
    const row = await db.get<any>(
      `
      SELECT
        COUNT(*) AS games_played,
  
        -- wins: winner_user_id matches me
        SUM(CASE WHEN ag.winner_user_id = ? THEN 1 ELSE 0 END) AS wins,
  
        -- losses:
        -- 1) someone else won (winner_user_id != me)
        -- 2) OR winner_user_id is NULL BUT opponent is AI (AI won)
        SUM(
          CASE
            WHEN ag.winner_user_id IS NOT NULL AND ag.winner_user_id != ? THEN 1
            WHEN ag.winner_user_id IS NULL AND ap_op.is_ai = 1 THEN 1
            ELSE 0
          END
        ) AS losses,
  
        AVG(ap_user.round_wins) AS avg_user_rounds,
        AVG(ap_op.round_wins) AS avg_opponent_rounds,
  
        SUM(CASE WHEN ap_op.is_ai = 1 THEN 1 ELSE 0 END) AS games_vs_ai,
        SUM(CASE WHEN ap_op.is_ai = 0 THEN 1 ELSE 0 END) AS games_vs_human
      FROM arena_players ap_user
      JOIN arena_games ag
        ON ag.id = ap_user.arena_game_id
       AND ag.status = 'finished'
      LEFT JOIN arena_players ap_op
        ON ap_op.arena_game_id = ap_user.arena_game_id
       AND ap_op.id != ap_user.id
      WHERE ap_user.user_id = ?
      `,
      [userId, userId, userId]
    );
  
    const gamesPlayed = Number(row?.games_played ?? 0);
    const wins = Number(row?.wins ?? 0);
    const losses = Number(row?.losses ?? 0);
  
    return {
      userId,
      gamesPlayed,
      wins,
      losses,
      winRate: gamesPlayed > 0 ? wins / gamesPlayed : 0,
      avgUserRoundsWon: Number(row?.avg_user_rounds ?? 0),
      avgOpponentRoundsWon: Number(row?.avg_opponent_rounds ?? 0),
      vsAI: Number(row?.games_vs_ai ?? 0),
      vsHuman: Number(row?.games_vs_human ?? 0),
    };
  },
  
  
  async createGameAndAddPlayers(players: PlayerInput[], win_target = 5): Promise<number> {
    const res = await db.run(
      `INSERT INTO arena_games (status, target_round_wins, created_at)
       VALUES ('waiting', ?, CURRENT_TIMESTAMP)`,
      [win_target]
    );
  
    const gameId = res.lastID as number;
    if (!gameId) throw new Error("Failed to create arena game");
  
    for (const p of players) {
      await db.run(
        `INSERT INTO arena_players (arena_game_id, user_id, position, round_wins, is_ai)
         VALUES (?, ?, ?, 0, ?)`,
        [gameId, p.user_id ?? null, p.position, p.is_ai ? 1 : 0]
      );
    }
  
    return gameId;
  },
  

  async getGameDetail(gameId: number): Promise<ArenaGameDetail | undefined> {
    return db.get<ArenaGameDetail>(
      `SELECT
          id,
          status,
          winner_user_id,
          target_round_wins,
          created_at,
          started_at,
          ended_at
       FROM arena_games
       WHERE id = ?`,
      [gameId]
    );
  },
  

  async getGamePlayers(gameId: number): Promise<ArenaGamePlayerDetail[]> {
    const rows = await db.all<any>(
      `SELECT
          ap.position,
          ap.user_id,
          u.username,
          u.display_name,
          u.profile_picture,
          u.image_src,
          ap.round_wins,
          ap.is_ai,
          ap.last_x,
          ap.last_y,
          ap.joined_at
       FROM arena_players ap
       LEFT JOIN users u ON ap.user_id = u.id
       WHERE ap.arena_game_id = ?
       ORDER BY ap.position ASC`,
      [gameId]
    );

    return rows.map((p: any) => ({
      position: p.position,
      user_id: p.user_id,
      username: p.username,
      display_name: p.display_name,
      profile_picture: p.profile_picture,
      image_src: p.image_src,
      round_wins: p.round_wins ?? 0,
      is_ai: !!p.is_ai,
      last_x: p.last_x ?? 0,
      last_y: p.last_y ?? 0,
      joined_at: p.joined_at,
    }));
  },

  async start(gameId: number): Promise<void> {
    await db.run(
      `UPDATE arena_games
       SET status='playing', started_at=CURRENT_TIMESTAMP
       WHERE id=? AND status='waiting'`,
      [gameId]
    );
  },

  async finish(gameId: number, winner_user_id: number | null): Promise<void> {
    await db.run(
      `UPDATE arena_games
       SET status='finished', winner_user_id=?, ended_at=CURRENT_TIMESTAMP
       WHERE id=? AND status!='finished'`,
      [winner_user_id, gameId]
    );
  },

  async cancel(gameId: number): Promise<void> {
    await db.run(
      `UPDATE arena_games
       SET status='cancelled', ended_at=CURRENT_TIMESTAMP
       WHERE id=? AND status!='finished'`,
      [gameId]
    );
  },

  async getGamesByStatus(status: ArenaGameStatus) {
    return db.all(
      `SELECT id, status, winner_user_id, target_round_wins, created_at, started_at, ended_at
       FROM arena_games
       WHERE status=?
       ORDER BY created_at DESC`,
      [status]
    );
  },

  async getMatchHistoryForUser(userId: number) {
    return db.all(
      `SELECT
          ag.id as matchId,
          COALESCE(ag.ended_at, ag.created_at) as date,
          (ag.winner_user_id = ap_user.user_id) as isWin,
          ap_user.round_wins as user_score,
          ap_op.round_wins as opponent_score,
          u_op.username as opponent_name,
          u_op.profile_picture as opponent_avatar
       FROM arena_players ap_user
       JOIN arena_games ag ON ap_user.arena_game_id = ag.id
       LEFT JOIN arena_players ap_op
         ON ap_user.arena_game_id = ap_op.arena_game_id
        AND ap_user.id != ap_op.id
       LEFT JOIN users u_op ON ap_op.user_id = u_op.id
       WHERE ap_user.user_id=? AND ag.status='finished'
       ORDER BY date DESC`,
      [userId]
    );
  },
  

  async incrementRoundWin(gameId: number, position: 1 | 2) {
    const res = await db.run(
      `UPDATE arena_players
       SET round_wins = round_wins + 1
       WHERE arena_game_id=? AND position=?`,
      [gameId, position]
    );
    if (res.changes === 0) throw new Error("Player not found for that position");
  },
  
  
  async setPlayerLastPosition(gameId: number, position: 1 | 2, x: number, y: number) {
    const res = await db.run(
      `UPDATE arena_players
       SET last_x=?, last_y=?
       WHERE arena_game_id=? AND position=?`,
      [x, y, gameId, position]
    );
    if (res.changes === 0) throw new Error("Player not found for that position");
  },

  async addEvent(gameId: number, type: string, payload: any = null) {
    await db.run(
      `INSERT INTO arena_events (arena_game_id, type, payload)
       VALUES (?, ?, ?)`,
      [gameId, type, payload ? JSON.stringify(payload) : null]
    );
  },
};



export default arenaRepository;
