import api from "@/api/api"
import { useQuery } from "@tanstack/react-query"
import type { Message, Contacts } from "../types"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const queryKeys = {
    friends: ["friends"],
    friendRequests: ["friendRequests"],
    pendingRequests: ["pendingRequests"],
    blockedUsers: ["blockedUsers"],
    searchUsers: (query: string) => ["searchUsers", query],
    chatMessages: (chatId: number) => ["messages", chatId],
    contacts: ["contacts"],
}

export const useChatMessages = (chatId: number | undefined) => {
    return useQuery({
        queryKey: ["messages", chatId],
        queryFn: async (): Promise<Message[]> => {
            const response = await api.get(`/api/chat/${chatId}/messages`)
            return response.data as Message[]
        },
        enabled: !!chatId,
    })
}
export const useContacts = () => {
    return useQuery({
        queryKey: queryKeys.contacts,
        queryFn: async (): Promise<Contacts[]> => {
            const response = await api.get("/api/chat/contacts")
            return response.data as Contacts[]
        },
    })
}

export const useBlockUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, action }: { userId: number; action: boolean }): Promise<unknown> => {
            const response = await api.post("/api/user/block", { user_id: userId, action })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.contacts })
        },
    })
}
