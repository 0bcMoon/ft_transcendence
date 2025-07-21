import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import toast from "react-hot-toast";


interface IRequest {

    req_id: number | null;
    user_id: number;
}

export const useCancelRequest = () => {
    const queryClient = useQueryClient(); // should only call in a component or hook (cause it uses React context)
    return useMutation({
        mutationFn: ({ req_id }: IRequest) => api.delete(`/user/requests/${req_id}`),
        // unused variables parameter is removed, as it was not being used in the original code
        onSuccess: (_, variables) => {
            const { user_id } = variables; // destructure variables to get req_id and user_id

            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ['users', user_id] });

            queryClient.invalidateQueries({ queryKey: ['users'] });
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
        mutationFn: ({ req_id, user_id }: IRequest) => api.patch("/user/requests", { req_id, user_id, action: true, type: 'friend' }),
        onSuccess: () => {
            toast.success("Request accepted successfully");
            queryClient.invalidateQueries({ queryKey: ["search"] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not accept request");
        }
    });
};


export const useDenyRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ req_id, user_id }: IRequest) => api.patch("/user/requests", { req_id, user_id, action: false, type: 'friend' }),
        onSuccess: () => {
            toast.success("Request has been deny successfully");
            queryClient.invalidateQueries({ queryKey: ["search"] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not deny friend request");
        }
    });
};



export const useBlockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ user_id }: { user_id: number }) => api.post("/user/block", { user_id, action: true }),
        onSuccess: () => {
            toast.success("User has been blocked successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not block user");
        }
    });
};

export const useUnBlockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ user_id }: { user_id: number }) => api.patch("/user/block", { user_id, action: false }),
        onSuccess: () => {
            toast.success("Request has been deny successfully");
            queryClient.invalidateQueries({ queryKey: ["search"] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not unblock user");
        }
    });
};
