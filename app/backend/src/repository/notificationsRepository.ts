import db from "../../db/db";

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    is_read: boolean;
    created_at: string;
}

export interface NotificationInput {
    user_id: number;
    title: string;
    message: string;
    link?: string | null;
    type?: string;
    is_read?: boolean;
}

export const NotificationRepository = {

    create: async (input: NotificationInput): Promise<Notification> => {

        const { user_id, title, message, type, link, is_read = false } = input;
        const result = await db.run(
            `INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [user_id, type, title, message, link ?? null, is_read ? 1 : 0]
        );
        return {
            id: result.lastID!,
            user_id,
            type: type || 'notification',
            title,
            message,
            link: link ?? null,
            is_read,
            created_at: new Date().toISOString(),
        };
    },

    getUnreadCount: async (userId: number): Promise<number> => {
        const result = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count 
            FROM notifications 
            WHERE user_id = ? AND is_read = 0`,
            [userId]
        );
        return result?.count || 0;
    },

    getAll: async (userId: number, limit: number, offset: number): Promise<Notification[]> => {
        return await db.all<Notification>(
            `SELECT * FROM notifications 
            WHERE user_id = ?
            ORDER BY is_read ASC, created_at DESC 
            LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
    },

    markAsRead: async (id: number, userId: number): Promise<void> => {
        await db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, userId]);
    },
};

