import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import toast from "react-hot-toast";
import { IFormData } from "@/zod/zod-schema";


interface IRequest {

    req_id: number ;
    user_id?: number;
}

export const useCancelRequest = () => {
    const queryClient = useQueryClient(); // should only call in a component or hook (cause it uses React context)
    return useMutation({
        mutationFn: async ({ req_id }: IRequest) => await api.delete(`api//user/requests/${req_id}`),
        // unused variables parameter is removed, as it was not being used in the original code
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users', variables.user_id] });
            queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
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
        mutationFn: ({ req_id, user_id }: IRequest) => api.patch("/api/user/requests", { req_id, user_id, action: true, type: 'friend' }),
        onSuccess: (_, variables) => {
            toast.success("Request accepted successfully");
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
            queryClient.invalidateQueries({ queryKey: ["users", variables.user_id] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not accept request");
        }
    });
};


export const useDenyRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ req_id, user_id }: IRequest) => api.patch("/api/user/requests", { req_id, user_id, action: false, type: 'friend' }),
        onSuccess: (_, variables) => {
            toast.success("Request has been deny successfully");
            // TODO: maybe use searchStore to update the search results
            queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
            queryClient.invalidateQueries({ queryKey: ['users', variables.user_id] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not deny friend request");
        }
    });
};

export const useBlockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ action, user_id }: { action: boolean, user_id: number }) => api.post("/api/user/block", { user_id, action }),
        onSuccess: (_, variables) => {
            const action = variables.action; // true for block, false for unblock
            toast.success(
                action
                    ? 'User has been blocked successfully'
                    : 'User has been unblocked successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['users', variables.user_id] });
            queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });

            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not Do this Action ");
        }
    });
};

// TODO: may be make this a generic function to send requests

export const useSendRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ user_id }: { user_id: number }) => {
            const response = await api.post(`/api/user/requests`, { user_id, type: "friend" });
            return response.data;
        },
        onSuccess: async (_, variables) => {
            toast.success("Friend request sent successfully");
            queryClient.invalidateQueries({ queryKey: ['users', variables.user_id] });
        },
        onError: async (error: any) => {
            toast.error(error.response?.data?.message || "Internal Server Error");
        },
    })
};


export const useUnFriend = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ user_id }: { user_id: number }) => {
            const response = await api.delete(`/api/user/friends/${user_id}`);
            return response.data;
        },
        onSuccess: async (data, variables) => {
            toast.success(data.message || "Unfriended successfully");
            queryClient.invalidateQueries({ queryKey: ['users', variables.user_id] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
        },
        onError: async (error: any) => {
            toast.error(error.response?.data?.message || "Internal Server Error");
        },
    })
};

interface IUpdateState {
    type: 'error' | 'success';
    message: string;
}

interface IUpdateProfilePicture {

    setUpdateState: (state: IUpdateState | null) => void;
}

export const useUpdateUserProfile = ({ setUpdateState }: IUpdateProfilePicture) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: IFormData) => {
            const response = await api.patch("/api/user/update/info", formData);
            return response.data;
        },
        onSuccess: (data) => {
            setUpdateState({ type: 'success', message: data.message || "Profile updated successfully" });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error: any) => {
            setUpdateState({ type: 'error', message: error.response?.data?.message || "Failed to update profile" });
        }
    });

}

export const useUpdateProfilePicture = ({ setUpdateState }: IUpdateProfilePicture) => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (form: any) => {
            const response = await api.patch("/api/user/update/profile_picture", form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            setUpdateState({ type: 'success', message: data.message || "Profile picture updated successfully" });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error: any) => {
            setUpdateState({ type: 'error', message: error.response?.data?.message || "Failed to update profile picture" });
        }
    });

}
