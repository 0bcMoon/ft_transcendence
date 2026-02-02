import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gameApi } from '../api/gameApi';

export function useCreateTournament() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gameApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments", "list"] });
    },
  });
}

/**
 * Register to tournament mutation
 */
export function useRegisterTournament() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tournamentId: number) => gameApi.register(tournamentId),

        onSuccess: (_, tournamentId) => {
            // Invalidate all relevant queries directly using bracket/array syntax
            queryClient.invalidateQueries({
                queryKey: ["tournaments", "detail", tournamentId]
            });
            queryClient.invalidateQueries({
                queryKey: ["tournaments", "players", tournamentId]
            });
            queryClient.invalidateQueries({
                queryKey: ["tournaments", "list"]
            });

            toast.success('Registration Successful!', {
                description: 'Good luck in the tournament! 🏆',
            });
        },

        onError: (error: any) => {
            const message = error?.response?.data?.error || 'Failed to register';
            toast.error('Registration Failed', {
                description: message,
            });
        },
    });
}
