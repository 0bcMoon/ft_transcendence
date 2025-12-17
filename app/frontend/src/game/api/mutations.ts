import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { gameApi, tournamentApi } from './gameApi';
import type { Game, GamePlayer } from './gameApi';
import type { GameMode } from '@/types/types';


type GameInput = {
    mode: GameMode;
    players: { user_id: number | null; position: number }[];
};

type GameResponse = {
    game: Game;
    players: GamePlayer[];
};

/* ---------------- Game Mutations ---------------- */


export const useCreateGame = () => {
    const queryClient = useQueryClient()

    return useMutation<GameResponse, Error, GameInput>({
        mutationFn: ({ mode, players }) => gameApi.createGame(mode, players),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['games'] })
            toast.success(`Game created successfully! Mode: ${data.game.mode}`)
        },
        onError: (error) => {
            toast.error(`Error creating game: ${error.message}`)
        },
    })
}

export const useStartGame = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (gameId: number) => gameApi.startGame(gameId),
        onSuccess: (_, gameId) => {
            queryClient.invalidateQueries({ queryKey: ['game', gameId] })
            toast.success('Game started successfully!')
        },
        onError: (error: Error) => {
            toast.error(`Error starting game: ${error.message}`)
        },
    })
}

export function useUpdateScore() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, score, position }: { gameId: number; score: number; position: number }) =>
            gameApi.updateScore({ gameId, score, position }),
        onSuccess: (_, { gameId }) => {
            queryClient.invalidateQueries({ queryKey: ['game', gameId] });
            toast.success('Score updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(`Error updating score: ${error.message}`);
        },
    });
}

export function useFinishGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, winnerId }: { gameId: number; winnerId?: number | null }) =>
            gameApi.finishGame(gameId, winnerId ?? null),
        onSuccess: (_, { gameId }) => {
            toast.success('Game finished successfully!');
            queryClient.invalidateQueries({ queryKey: ['game', gameId] });
            queryClient.invalidateQueries({ queryKey: ['games'] });
        },
        onError: (error: Error) => {
            toast.error(`Error finishing game: ${error.message}`);
        },
    });
}

export function useCancelGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (gameId: number) => gameApi.cancelGame(gameId),
        onSuccess: (_, gameId) => {
            toast.success('Game cancelled successfully!');
            queryClient.invalidateQueries({ queryKey: ['game', gameId] });
            queryClient.invalidateQueries({ queryKey: ['games'] });
        },
        onError: (error: Error) => {
            toast.error(`Error cancelling game: ${error.message}`);
        },
    });
}

type TournamentInput = {
    name: string;
    maxPlayers?: number;
};

/* ---------------- Tournament Mutations ---------------- */

export function useCreateTournament() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: TournamentInput) =>
            tournamentApi.createTournament(payload.name, payload.maxPlayers),
        onSuccess: (data) => {
            toast.success(`Tournament "${data.name}" created!`);
            queryClient.invalidateQueries({ queryKey: ['tournaments'] });
        },
        onError: (error) => {
            toast.error(`Error creating tournament: ${error.message}`);
        },
    });
}

export function useRegisterTournamentPlayer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { tournamentId: number; userId: number; alias: string }) =>
            tournamentApi.registerPlayer(payload.tournamentId),
        onSuccess: (_, variables) => {
            toast.success("Successfully joined tournament!");
            queryClient.invalidateQueries({ queryKey: ['tournaments'] });
            queryClient.invalidateQueries({ queryKey: ['tournamentBracket', variables.tournamentId] });
        },
        onError: (error) => {
            toast.error(`Error joining: ${error.message}`);
        },
    });
}

export function useStartTournament() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tournamentId: number) => tournamentApi.startTournament(tournamentId),
        onSuccess: (tournament) => {
            toast.success(`Tournament started!`);
            queryClient.invalidateQueries({ queryKey: ['tournaments'] });
            queryClient.invalidateQueries({ queryKey: ['tournament', tournament] });
        },
        onError: (error) => {
            toast.error(`Error starting tournament: ${error.message}`);
        },
    });
}


