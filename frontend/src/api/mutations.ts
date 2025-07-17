import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import toast from "react-hot-toast";


interface ICancelRequest {

    req_id: number;
    user_id: number;
}

export const useCancelRequest = () => {
    const queryClient = useQueryClient(); // should only call in a component or hook (cause it uses React context)
    return useMutation({
        mutationFn: ({ req_id }: ICancelRequest) => api.delete(`/user/requests/${req_id}`),
        // unused variables parameter is removed, as it was not being used in the original code
        onSuccess: (_, variables) => {
            const { user_id } = variables; // destructure variables to get req_id and user_id

            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ['users', user_id] });
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
