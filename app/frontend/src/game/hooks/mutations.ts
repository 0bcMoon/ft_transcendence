import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { gameApi } from '../api/gameApi';

export function useCreateTournament() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gameApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments", "list"] });
      toast.success("Tournament created successfully!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create tournament";
      toast.error(errorMessage);
    },
  });
}

export function useRegisterTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tournamentId: number) => gameApi.register(tournamentId),
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({
        queryKey: ["tournaments", "detail", tournamentId]
      });
      queryClient.invalidateQueries({
        queryKey: ["tournaments", "players", tournamentId]
      });
      queryClient.invalidateQueries({
        queryKey: ["tournaments", "list"]
      });
      toast.success("Successfully registered for tournament!");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to register for tournament";
      toast.error(errorMessage);
    },
  });
}
