import api from '@/api/api';
import { Notification } from '../types/index'

export interface Notifications {
    id: number;
    user_id: number;
    title: string;
    message: string;
    link?: string | null;
    is_read: boolean;
    created_at: string;
    sender?: {
        id: number;
        name: string;
        profile_picture: string;
    };
}

export const notificationApi = {

    getNotifications: async (page: number = 1, limit: number = 10): Promise<Notification[]> => {
        const offset = (page - 1) * limit;
        const { data } = await api.get<Notification[]>('/api/notifications', { params: { limit, offset } });
        return data;
    },

    markAsRead: async (notificationId: number): Promise<void> => {
        await api.patch(`/api/notifications/${notificationId}/read`);
    },

    getUnreadCount: async (): Promise<number> => {
        const { data } = await api.get<{ count: number }>('/api/notifications/unread/count');
        return data.count;
    },

    getRecentByUser: async (userId: number, limit: number = 5): Promise<Notification[]> => {
        const { data } = await api.get<Notification[]>( `/api/users/${userId}/notifications/recent`, { params: { limit } });
        return data;
    },

    markAllAsRead: async (userId: number): Promise<void> => {
        await api.patch(`/api/users/${userId}/notifications/read-all`);
    },

    delete: async (notificationId: number): Promise<void> => {
        await api.delete(`/api/notifications/${notificationId}`);
    },

    getAllByUser: async (userId: number): Promise<Notification[]> => {
        const { data } = await api.get<Notification[]>(
            `/api/users/${userId}/notifications`
        );
        return data;
    },

    getUnreadByUser: async (userId: number): Promise<Notification[]> => {
        const { data } = await api.get<Notification[]>(
            `/api/users/${userId}/notifications/unread`
        );
        return data;
    },
};
