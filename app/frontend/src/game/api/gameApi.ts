import api from '@/api/api';

export type GameMode = 'ai' | 'local' | 'remote' | 'tournament';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'cancelled';
export type TournamentStatus = 'registration' | 'active' | 'finished' | 'cancelled';

// --- Game Types ---
export interface Game {
    id: number;
    mode: GameMode;
    status: GameStatus;
    winner_id: number | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
}
export interface MatchHistoryItemData {
    matchId: number;
    mode: GameMode;
    date: string;       // This will be the 'ended_at' timestamp
    isWin: boolean;
    user_score: number;
    opponent_score: number;
    opponent_name: string | null; // Opponent's name (or null if AI/local)
    opponent_avatar: string | null; // Opponent's avatar (or null)
}
export interface GamePlayer {
    id: number;
    game_id: number;
    user_id: number | null;
    position: number;
    score: number;
    is_ai: boolean;
    joined_at: string;
}

export interface GamePlayer {
    id: number;
    game_id: number;
    user_id: number | null;
    position: number;
    score: number;
    is_ai: boolean;
    joined_at: string;
}

// 2. This adds the joined 'users' table data
export interface GamePlayerDetails extends GamePlayer {
    username: string | null;
    avatar: string | null;
}

// 3. This is the final type
// It combines the 'Game' type with the new 'GamePlayerDetails' array
export interface GameWithPlayers extends Game {
    players: GamePlayerDetails[];
}

// --- Tournament Types ---
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

export interface TournamentGame {
    id: number;
    tournament_id: number;
    game_id: number;
    round: number;
    match_order: number;
    created_at: string;
}

// --- Bracket-Specific Types ---
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


export interface BracketData {
    tournament: Tournament;
    players: TournamentPlayer[];
    games: { round: number; matches: BracketMatch[] }[];
}

export interface GlobalMatchData {
    matchId: number;
    mode: GameMode;
    date: string;
    player1_name: string;
    player1_avatar: string;
    player1_score: number;
    player2_name: string;
    player2_avatar: string;
    player2_score: number;
    winner_id: number | null;
}

// ==================== GAME API ======================================

type PlayerInput = { user_id: number | null; position: number };

type UpdateScoreInput = {
    gameId: number;
    score: number;
    userId?: number;
    position?: number
};

export type UserStats = {
    wins: number;
    losses: number;
    winRate: number; // percent (0-100)
    score: number;   // wins*3 - losses
    rank: number | null;
};

export const gameApi = {

    async getRecentGlobalMatches(limit: number = 10) {
        const { data } = await api.get<GlobalMatchData[]>(`/api/games/recent/global?limit=${limit}`);
        console.log("Fetched recent global matches:", data);
        return data;
    },

    async getUserScoreProgression(userId: number, limit = 10) {
        const { data } = await api.get(`/api/users/${userId}/score-progression?limit=${limit}`);
        return data; // [{ matchId, date, score }, ...]
    },

    async getUserStats(userId: number) {
        const { data } = await api.get<UserStats>(`/api/users/${userId}/stats`);
        return data;
    },

    async createGame(mode: GameMode, players: PlayerInput[]) {
        const { data } = await api.post<{ game: Game; players: GamePlayer[] }>('/api/games', { mode, players });
        return data;
    },

    async startGame(gameId: number) {
        const { data } = await api.post<{ game: Game }>('/api/games/start', { game_id: gameId });
        return data;
    },

    async updateScore(payload: UpdateScoreInput) {
        const { data } = await api.post<{ success: boolean }>('/api/games/score', {
            game_id: payload.gameId,
            score: payload.score,
            user_id: payload.userId,
            position: payload.position,
        });
        return data;
    },

    async finishGame(gameId: number, winnerId: number | null) {
        const { data } = await api.patch<{ game: Game }>(`/api/games/${gameId}/finish`, {
            winner_id: winnerId ?? null,
        });
        return data;
    },

    async cancelGame(gameId: number) {
        const { data } = await api.post<{ game: Game }>('/api/games/cancel', { game_id: gameId });
        return data;
    },

    async getMatchHistory(userId: number) {
        const { data } = await api.get<MatchHistoryItemData[]>(`/api/users/${userId}/match-history`);
        return data;
    },

    async getGameDetails(gameId: number) {
        const { data } = await api.get<GameWithPlayers>(`/api/games/${gameId}`);
        return data;
    },

    async getGamePlayers(gameId: number) {
        const { data } = await api.get<GamePlayerDetails[]>(`/api/games/${gameId}/players`);
        return data;
    },

};



// ==================== TOURNAMENT API ================================

export const tournamentApi = {
    async createTournament(name: string, maxPlayers: number = 8) {
        const { data } = await api.post<{ tournament: Tournament }>('/api/tournaments', {
            name, max_players: maxPlayers
        });
        return data.tournament;
    },

    async registerPlayer(tournamentId: number, userId: number, alias: string) {
        const { data } = await api.post<{ registration_id: number; players: TournamentPlayer[] }>(
            `/api/tournaments/${tournamentId}/register`,
            { user_id: userId, alias }
        );
        return data;
    },

    async cancelTournament(tournamentId: number) {
        const { data } = await api.post<{ tournament: Tournament; message: string }>(
            `/api/tournaments/${tournamentId}/cancel`, {});
        return data;
    },

    async advanceRound(tournamentId: number) {
        const { data } = await api.post<{ tournament: Tournament; message: string }>(
            `/api/tournaments/${tournamentId}/advance`, {});
        return data;
    },

    async startTournament(tournamentId: number) {
        const { data } = await api.post<{ tournament: Tournament }>(`/api/tournaments/${tournamentId}/start`, {});
        return data.tournament;
    },

    async getTournament(tournamentId: number) {
        const { data } = await api.get<{ tournament: Tournament }>(`/api/tournaments/${tournamentId}`);
        return data.tournament;
    },

    async listTournaments() {
        const { data } = await api.get<{ tournaments: (Tournament & { players: TournamentPlayer[] })[] }>('/api/tournaments');
        return data.tournaments;
    },

    async listPlayers(tournamentId: number) {
        const { data } = await api.get<{ players: TournamentPlayer[] }>(`/api/tournaments/${tournamentId}/players`);
        return data.players;
    },

    async getTournamentGames(tournamentId: number) {
        const { data } = await api.get<{ games: TournamentGame[] }>(`/api/tournaments/${tournamentId}/games`);
        return data.games;
    },

    async getRoundGames(tournamentId: number, round: number) {
        const { data } = await api.get<{ games: TournamentGame[] }>(
            `/api/tournaments/${tournamentId}/rounds/${round}/games`);
        return data.games;
    },

    async getBracket(tournamentId: number) {
        const { data } = await api.get<BracketData>(`/api/tournaments/${tournamentId}/bracket`);
        return data;
    },


};
