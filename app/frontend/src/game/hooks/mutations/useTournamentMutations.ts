// hooks/mutations/useTournamentMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tournamentApi } from '../../api/tournament.api';
import { tournamentKeys } from '../keys/tournament.keys';
import type { Tournament } from '../../types/tournament';

/**
 * Create tournament mutation
 */
export function useCreateTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, maxPlayers }: { name: string; maxPlayers: number }) =>
            tournamentApi.create(name, maxPlayers),

        onMutate: async () => {
            // Optional: Show loading toast
            toast.loading('Creating tournament...');
        },

        onSuccess: (tournament: Tournament) => {
            // Dismiss loading toast
            toast.dismiss();

            // Invalidate tournaments list
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.lists()
            });

            // Show success toast
            toast.success('Tournament Created! ', {
                description: `${tournament.name} is now open for registration`,
            });
        },

        onError: (error: any) => {
            // Dismiss loading toast
            toast.dismiss();

            // Handle validation errors
            if (error.response?.data?.details) {
                const details = error.response.data.details;
                const messages = Array.isArray(details)
                    ? details.map((d: any) => d.message).join(', ')
                    : details;

                toast.error('Validation Error', {
                    description: messages,
                });
            } else {
                // Generic error
                const message = error.response?.data?.error || error.message || 'Failed to create tournament';
                toast.error('Creation Failed', {
                    description: message,
                });
            }
        },
    });
}

/**
 * Register to tournament mutation
 */
export function useRegisterTournament() {
    const queryClient = useQueryClient();

    console.log('Tournament created:');
    return useMutation({

        mutationFn: (tournamentId: number) => tournamentApi.register(tournamentId),

        onSuccess: (_, tournamentId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.detail(tournamentId)
            });
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.players(tournamentId)
            });
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.lists()
            });

            // Show success toast
            toast.success('Registration Successful!', {
                description: 'Good luck in the tournament!  🏆',
            });
        },

        onError: (error: any) => {
            const message = error.response?.data?.error || 'Failed to register';
            toast.error('Registration Failed', {
                description: message,
            });
        },
    });
}

/**
 * Start tournament mutation
 */
export function useStartTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tournamentId: number) => tournamentApi.start(tournamentId),

        onSuccess: (_, tournamentId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.detail(tournamentId)
            });
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.lists()
            });

            // Show success toast with action
            toast.success('Tournament Started!', {
                description: 'Let the games begin! 🎮',
                action: {
                    label: 'View Bracket',
                    onClick: () => {
                        window.location.href = `/tournaments/${tournamentId}/bracket`;
                    },
                },
            });
        },

        onError: (error: any) => {
            const message = error.response?.data?.error || 'Failed to start tournament';
            toast.error('Start Failed', {
                description: message,
            });
        },
    });
}

/**
 * Cancel tournament mutation
 */
export function useCancelTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tournamentId: number) => tournamentApi.cancel(tournamentId),

        onSuccess: (_, tournamentId) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.detail(tournamentId)
            });
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.lists()
            });

            // Show success toast
            toast.success('Tournament Cancelled', {
                description: 'All players have been notified',
            });
        },

        onError: (error: any) => {
            const message = error.response?.data?.error || 'Failed to cancel tournament';
            toast.error('Cancellation Failed', {
                description: message,
            });
        },
    });
}

/**
 * Advance round mutation
 */
export function useAdvanceRound() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tournamentId: number) => tournamentApi.advanceRound(tournamentId),

        onSuccess: (_, tournamentId) => {
            // Invalidate all tournament-related queries
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.detail(tournamentId)
            });
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.bracket(tournamentId)
            });
            queryClient.invalidateQueries({
                queryKey: tournamentKeys.games(tournamentId)
            });

            // Show success toast
            toast.success('Round Advanced!', {
                description: 'Next round has begun',
            });
        },

        onError: (error: any) => {
            const message = error.response?.data?.error || 'Failed to advance round';
            toast.error('Advance Failed', {
                description: message,
            });
        },
    });
}
