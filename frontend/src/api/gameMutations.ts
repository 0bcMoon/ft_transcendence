import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { gameApi } from './game';
import type { GameMode, GameStatus } from './game';
/* ---------------- Query Keys ---------------- */

export const qk = {
    // Games
    game: (id: number) => ['game', id] as const,
    games: (status: GameStatus, mode?: GameMode) => ['games', { status, mode: mode ?? 'all' }] as const,
    myGames: ['games', 'my'] as const,
    myStats: ['games', 'stats', 'my'] as const,
    leaderboard: (limit?: number) => ['games', 'leaderboard', limit ?? 10] as const,

    // Tournaments
    tournaments: ['tournaments'] as const,
    tournament: (id: number) => ['tournament', id] as const, // (use if you add a detail endpoint later)
    tournamentPlayers: (id: number) => ['tournament', id, 'players'] as const,
};

/* ---------------- Toast Helpers ---------------- */

const notify = {
    error: (err: any, fallback: string) =>
        toast.error(
            err?.response?.data?.message ??
            err?.response?.data?.error ??
            err?.message ??
            fallback
        ),
    success: (msg?: string) => toast.success(msg ?? 'Success'),
};

/* ---------------- Utility ---------------- */

const invalidateGames = (qc: ReturnType<typeof useQueryClient>, statuses: GameStatus[]) => {
    statuses.forEach(st => qc.invalidateQueries({ queryKey: qk.games(st) }));
};

/* ---------------- Game Mutations (existing) ---------------- */

export function useCreateGame() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { mode: GameMode; players: { user_id: number | null; position: number }[] }) =>
            gameApi.createGame(payload.mode, payload.players),
        onSuccess: () => {
            notify.success('Game created');
            qc.invalidateQueries({ queryKey: qk.myGames });
            invalidateGames(qc, ['waiting', 'playing']);
        },
        onError: err => notify.error(err, 'Failed to create game'),
    });
}

export function useStartGame() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (gameId: number) => gameApi.startGame(gameId),
        onSuccess: (_, gameId) => {
            notify.success('Game started');
            qc.invalidateQueries({ queryKey: qk.game(gameId) });
            invalidateGames(qc, ['playing', 'waiting']);
            qc.invalidateQueries({ queryKey: qk.myGames });
        },
        onError: err => notify.error(err, 'Failed to start game'),
    });
}

export function useUpdateScore() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { gameId: number; score: number; userId?: number; position?: number }) =>
            gameApi.updateScore(payload),
        onSuccess: (_, { gameId }) => {
            notify.success('Score updated');
            qc.invalidateQueries({ queryKey: qk.game(gameId) });
        },
        onError: err => notify.error(err, 'Failed to update score'),
    });
}

export function useFinishGame() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, winnerId }: { gameId: number; winnerId?: number | null }) =>
            gameApi.finishGame(gameId, winnerId),
        onSuccess: (_, { gameId }) => {
            notify.success('Game finished');
            qc.invalidateQueries({ queryKey: qk.game(gameId) });
            qc.invalidateQueries({ queryKey: qk.myStats });
            qc.invalidateQueries({ queryKey: qk.leaderboard() });
            invalidateGames(qc, ['finished', 'playing']);
            qc.invalidateQueries({ queryKey: qk.myGames });
        },
        onError: err => notify.error(err, 'Failed to finish game'),
    });
}

export function useCancelGame() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (gameId: number) => gameApi.cancelGame(gameId),
        onSuccess: (_, gameId) => {
            notify.success('Game cancelled');
            qc.invalidateQueries({ queryKey: qk.game(gameId) });
            invalidateGames(qc, ['waiting', 'playing', 'finished']);
            qc.invalidateQueries({ queryKey: qk.myGames });
        },
        onError: err => notify.error(err, 'Failed to cancel game'),
    });
}


export function useCreateTournament() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { name: string; maxPlayers?: number }) =>
            gameApi.createTournament(payload.name, payload.maxPlayers),
        onSuccess: () => {
            notify.success('Tournament created');
            qc.invalidateQueries({ queryKey: qk.tournaments });
        },
        onError: err => notify.error(err, 'Failed to create tournament'),
    });
}

export function useRegisterTournamentPlayer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { tournamentId: number; userId: number; alias: string }) =>
            gameApi.registerPlayer(payload.tournamentId, payload.userId, payload.alias),
        onSuccess: (_, { tournamentId }) => {
            notify.success('Player registered');
            qc.invalidateQueries({ queryKey: qk.tournamentPlayers(tournamentId) });
            qc.invalidateQueries({ queryKey: qk.tournaments });
            // If you add a tournament detail query later:
            qc.invalidateQueries({ queryKey: qk.tournament(tournamentId) });
        },
        onError: err => notify.error(err, 'Failed to register player'),
    });
}


export function useStartTournament() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (tournamentId: number) => gameApi.startTournament(tournamentId),
        onSuccess: (t) => {
            toast.success('Tournament started');
            qc.invalidateQueries({ queryKey: qk.tournaments });
            qc.invalidateQueries({ queryKey: qk.tournamentPlayers(t.id) });
            qc.invalidateQueries({ queryKey: qk.tournament(t.id) });
        },
        onError: err => notify.error(err, 'Failed to start tournament'),
    });
}
