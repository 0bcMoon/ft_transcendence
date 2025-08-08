import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import toast from "react-hot-toast";
import { IFormData } from "@/zod/zod-schema";


interface IRequest {

    req_id?: number | null;
    user_id: number;
}

export const useCancelRequest = ({ req_id, user_id }: IRequest) => {
    const queryClient = useQueryClient(); // should only call in a component or hook (cause it uses React context)
    return useMutation({
        mutationFn: () => api.delete(`/user/requests/${req_id}`),
        // unused variables parameter is removed, as it was not being used in the original code
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ['users', user_id] });

            toast.success("Request cancelled successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel request");
        }
    });
};

export const useAcceptRequest = ({ req_id, user_id }: IRequest) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.patch("/user/requests", { req_id, user_id, action: true, type: 'friend' }),
        onSuccess: () => {
            toast.success("Request accepted successfully");
            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ["users", user_id] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not accept request");
        }
    });
};


export const useDenyRequest = ({ req_id, user_id }: IRequest) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.patch("/user/requests", { req_id, user_id, action: false, type: 'friend' }),
        onSuccess: () => {
            toast.success("Request has been deny successfully");
            // TODO: maybe use searchStore to update the search results
            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ['users', user_id] });
        },

        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not deny friend request");
        }
    });
};



export const useBlockUser = ({ user_id }: IRequest) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ action }: { action: boolean }) => api.post("/user/block", { user_id, action }),
        onSuccess: (_, variables) => {
            const action = variables.action; // true for block, false for unblock
            toast.success(
                action
                    ? 'User has been blocked successfully'
                    : 'User has been unblocked successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['search'] });
            queryClient.invalidateQueries({ queryKey: ['users', user_id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not Do this Action ");
        }
    });
};

// TODO: may be make this a generic function to send requests

export const useSendRequest = ({ user_id }: { user_id: number }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["friend-request", user_id],
        mutationFn: async () => {
            const response = await api.post(`/user/requests`, { user_id, type: "friend" });
            return response.data;
        },
        onSuccess: async () => {
            toast.success("Friend request sent successfully");
            queryClient.invalidateQueries({ queryKey: ['users', user_id] });
        },
        onError: async (error: any) => {
            toast.error(error.response?.data?.message || "Internal Server Error");
        },
    })
};


export const useUnFriend = ({ user_id }: { user_id: number }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/user/friends/${user_id}`);
            return response.data;
        },
        onSuccess: async (data) => {
            toast.success(data.message || "Unfriended successfully");
            queryClient.invalidateQueries({ queryKey: ['users', user_id] });
        },
        onError: async (error: any) => {
            toast.error(error.response?.data?.message || "Internal Server Error");
        },
    })
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: IFormData) => {
            const response = await api.patch("/user/update/info", formData);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    });

}

export const useUpdateProfilePicture = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (form: FormData) => {
            const response = await api.patch("/user/update/profile_picture", form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    });

}
