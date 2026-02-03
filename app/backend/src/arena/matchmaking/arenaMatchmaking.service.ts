import arenaRepository from "../repository/arenaRepository";

type MatchmakingResult =
  | { status: "idle" }
  | { status: "queued" }
  | { status: "matched"; gameId: number };


class ArenaMatchmakingService {
  private waitingUserId: number | null = null;
  private matchedGameByUserId = new Map<number, number>();

  async join(userId: number): Promise<MatchmakingResult> {

    const existing = this.matchedGameByUserId.get(userId);
    if (existing) {
      this.matchedGameByUserId.delete(userId); // ✅ consume
      return { status: "matched", gameId: existing };
    }
  
    if (this.waitingUserId === null) {
      this.waitingUserId = userId;
      return { status: "queued" };
    }
  
    if (this.waitingUserId === userId) {
      return { status: "queued" };
    }
  
    // Match found
    const p1 = this.waitingUserId;
    const p2 = userId;
  
    this.waitingUserId = null;
  
    const gameId = await arenaRepository.createGameAndAddPlayers(
      [
        { user_id: p1, position: 1 },
        { user_id: p2, position: 2 },
      ],
      5
    );
  
    await arenaRepository.addEvent(gameId, "created", { via: "matchmaking", p1, p2 });
  
    this.matchedGameByUserId.set(p1, gameId);
    this.matchedGameByUserId.set(p2, gameId);
  
    this.matchedGameByUserId.delete(userId);
    return { status: "matched", gameId };
  }
  
  status(userId: number): MatchmakingResult {
    const gameId = this.matchedGameByUserId.get(userId);
    if (gameId) {
      this.matchedGameByUserId.delete(userId);
      return { status: "matched", gameId };
    }
  
    if (this.waitingUserId === userId)
      return { status: "queued" };
  
    return { status: "idle" };
  }
  
  

  leave(userId: number) {
    if (this.waitingUserId === userId) this.waitingUserId = null;
    return { status: "left" as const };
  }

  consumeMatch(userId: number) {
    this.matchedGameByUserId.delete(userId);
  }
}

export const arenaMatchmakingService = new ArenaMatchmakingService();
