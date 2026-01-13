import api, { login_api } from "@/api/api"
import { useQuery } from "@tanstack/react-query"
import type { Request } from "../types/User"
import type { RemoteUser } from "@/types/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { IFormData } from "@/zod/user.schema";

interface IUpdateState {
    type: "error" | "success"
    message: string
}

interface IUpdateProfilePicture {
    setUpdateState: (state: IUpdateState | null) => void
}


export const queryKeys = {
    friends: ["friends"],
    friendRequests: ["friendRequests"],
    pendingRequests: ["pendingRequests"],
    blockedUsers: ["blockedUsers"],
    searchUsers: (query: string) => ["searchUsers", query],
    chatMessages: (chatId: number) => ["messages", chatId],
    contacts: ["contacts"],
}


export const useFriends = () => {
    return useQuery({
        queryKey: queryKeys.friends,
        queryFn: async (): Promise<RemoteUser[]> => {
            const response = await api.get("/api/user/friends")
            return response.data as RemoteUser[]
        },
    })
}

export const useSearchUsers = (search: string) => {
    search = search.trim()
    return useQuery({
        queryKey: ["searchUsers", search],
        queryFn: async (): Promise<RemoteUser[]> => {
            const response = await api.get("/api/users", {
                params: {
                    search: search,
                },
            })
            return response.data as RemoteUser[]
        },
        enabled: search.length > 0, // Only run the query if search term is not empty
    })
}

export const useFriendRequests = () => {
    return useQuery({
        queryKey: queryKeys.friendRequests,
        queryFn: async (): Promise<Request[]> => {
            const response = await api.get("/api/user/friend-requests", { params: { type: "received" } })
            return response.data as Request[]
        },
    })
}

export const usePendingRequests = () => {
    return useQuery({
        queryKey: queryKeys.pendingRequests,
        queryFn: async (): Promise<Request[]> => {
            const response = await api.get("/api/user/friend-requests", { params: { type: "pending" } })
            return response.data as Request[]
        },
    })
}

export const useBlockedUsers = () => {
    return useQuery({
        queryKey: queryKeys.blockedUsers,
        queryFn: async (): Promise<RemoteUser[]> => {
            const response = await api.get("/api/user/block")
            return response.data as RemoteUser[]
        },
    })
}

export const useUserById = (userId: number | undefined) => {
    return useQuery({
        queryKey: ["users", userId],
        queryFn: async (): Promise<RemoteUser> => {
            const response = await api.get(`/api/user/${userId}`)
            return response.data as RemoteUser
        },
        enabled: !!userId && !isNaN(userId),
    })
}

export const useBlockUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, action }: { userId: number; action: boolean }): Promise<unknown> => {
            const response = await api.post("/api/user/block", { user_id: userId, action })
            return response.data
        },
        onSuccess: (_, variables) => {
            const action = variables.action
            const successMessage = action ? "User has been blocked successfully" : "User has been unblocked successfully"

            // Show success toast
            toast.success(successMessage)

            // Invalidate all related queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["users", variables.userId] })
            queryClient.invalidateQueries({ queryKey: queryKeys.blockedUsers })
            queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
            queryClient.invalidateQueries({ queryKey: queryKeys.friends })
            queryClient.invalidateQueries({ queryKey: ["searchUsers"] })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "Error: Could not perform this action"
            toast.error(errorMessage)
        },
    })
}

// Friend request mutation hooks
export const useAcceptRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ req_id, userId }: { req_id: number; userId: number }): Promise<unknown> => {
            const response = await api.patch("/api/user/requests", { req_id, user_id: userId, action: true, type: "friend" })
            return response.data
        },
        onSuccess: (_, variables) => {
            toast.success("Request accepted successfully")
            queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests })
            queryClient.invalidateQueries({ queryKey: ["users", variables.userId] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not accept request")
        },
    })
}

export const useDenyRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ req_id, userId }: { req_id: number; userId: number }): Promise<unknown> => {
            const response = await api.patch("/api/user/requests", { req_id, user_id: userId, action: false, type: "friend" })
            return response.data
        },
        onSuccess: (_, variables) => {
            toast.success("Request has been deny successfully")
            queryClient.invalidateQueries({ queryKey: queryKeys.friendRequests })
            queryClient.invalidateQueries({ queryKey: ["users", variables.userId] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not deny friend request")
        },
    })
}

export const useCancelRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ req_id }: { req_id: number }): Promise<unknown> => {
            const response = await api.delete(`api/user/requests/${req_id}`)
            return response.data
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests })
            queryClient.invalidateQueries({ queryKey: ["searchUsers"] })
            if (data?.userId) {
                queryClient.invalidateQueries({ queryKey: ["users", data.userId] })
            }
            toast.success("Request cancelled successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel request")
        },
    })
}

export const useUnFriend = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ user_id }: { user_id: number }): Promise<unknown> => {
            const response = await api.delete(`/api/user/friends/${user_id}`)
            return response.data
        },
        onSuccess: (_, variables) => {
            toast.success("User has been unfriended successfully")
            queryClient.invalidateQueries({ queryKey: ["users", variables.user_id] })
            queryClient.invalidateQueries({ queryKey: queryKeys.friends })
            queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
            queryClient.invalidateQueries({ queryKey: ["searchUsers"] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not unfriend user")
        },
    })
}

export const useSendRequest = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ user_id }: { user_id: number }): Promise<unknown> => {
            const response = await api.post(`/api/user/requests`, { user_id, type: "friend" })
            return response.data
        },
        onSuccess: (_, variables) => {
            toast.success("Friend request sent successfully")
            queryClient.invalidateQueries({ queryKey: ["users", variables.user_id] })
            queryClient.invalidateQueries({ queryKey: queryKeys.pendingRequests })
            queryClient.invalidateQueries({ queryKey: ["searchUsers"] })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Internal Server Error")
        },
    })
}

export const useStartChat = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId }: { userId: number }): Promise<RemoteUser> => {
            const response = await api.get("/api/chat/contact", { params: { id: userId } })
            return response.data as RemoteUser
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Could not start chat")
        },
    })
}


export const useUpdateUserProfile = ({ setUpdateState }: IUpdateProfilePicture) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (formData: IFormData) => {
            const response = await api.patch("/api/user/update/info", formData)
            return response.data
        },
        onSuccess: (data: any) => {
            setUpdateState({ type: "success", message: data.message || "Profile updated successfully" })
            queryClient.invalidateQueries({ queryKey: ["user"] })
            toast.success(data.message || "Profile updated successfully")
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Failed to update profile"
            setUpdateState({ type: "error", message: errorMessage })
            toast.error(errorMessage)
        },
    })
}

export const useUpdateProfilePicture = ({ setUpdateState }: IUpdateProfilePicture) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (form: FormData) => {
            const response = await api.patch("/api/user/update/profile_picture", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            return response.data
        },
        onSuccess: (data: any) => {
            setUpdateState({ type: "success", message: data.message || "Profile picture updated successfully" })
            queryClient.invalidateQueries({ queryKey: ["user"] })
            toast.success(data.message || "Profile picture updated successfully")
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Failed to update profile picture"
            setUpdateState({ type: "error", message: errorMessage })
            toast.error(errorMessage)
        },
    })
}

export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: { identifier: string; password: string }) => {
            const response = await login_api.post("/api/auth/login", data)
            return response.data
        },
    })
}

