import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import toast from "react-hot-toast";

export const useCancelRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req_id: number) => api.delete(`/user/requests/${req_id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["search"] });
            toast.success("Request cancelled successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel request");
        }
    });
};

export const useAcceptRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.post(`/user/friends/accept/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["search"] });
        }
    });
};

export const useDenyRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/user/requests/deny/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["search"] });
        }
    });
};
