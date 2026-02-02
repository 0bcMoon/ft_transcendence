import { useQuery } from "@tanstack/react-query";
import { notificationApi, Notifications } from "../api/notificationApi";
import { Notification } from '../types/index'


export const useGetNotifications = (page: number = 1, limit: number = 10) => {
    return useQuery<Notification[], Error>({
        queryKey: ["notifications", page, limit],
        queryFn: () => notificationApi.getNotifications(page, limit),
        enabled: page > 0 && limit > 0,
    });
};

export const useGetUnreadCount = () => {
  return useQuery<number, Error>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30000,
  });
};

export const useRecentNotifications = (userId?: number, limit: number = 5) => {
    return useQuery<Notifications[], Error>({
        queryKey: ["notifications", userId, "recent", limit],
        queryFn: () => {
            if (!userId) throw new Error("User ID is required");
            return notificationApi.getRecentByUser(userId, limit);
        },
        enabled: !!userId,
    });
};
