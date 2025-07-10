import assert from 'assert';
import db from '../../db/db';

export interface User {
    id: string,
    username: string,
    display_name: string,
    password: string | undefined,
    email: string,
    token: string | undefined | null,
    created_at: Date,
}
export type UserResponse = Omit<User, 'password'>;

export const userRepository = {

    getUserByUsername: async (username: string) => {
        return await db.get('SELECT * FROM users WHERE username = ?', [username]);
    },

    getUserById: async (id: number, userId: number) => {
        //TODO: check if u.i=sender_id and f.receiver_id = userId
        const sql: string = `
                        SELECT
                            u.id,
                            u.display_name,
                            u.username,
                            r.id req_id,
                            CASE
                                WHEN b.user_id IS NOT NULL THEN 'blocked'
                                WHEN f.sender_id IS NOT NULL THEN 'friend'
                                WHEN r.sender_id = 1 THEN 'pending'
                                WHEN r.receiver_id = 1 THEN 'waiting'
                                ELSE 'none'
                            END AS relation_status
                        FROM
                            users u
                        LEFT JOIN
                            blocks b ON (u.id = b.blocked_user_id AND b.user_id = $1)
                                        OR (u.id = b.user_id AND b.blocked_user_id = $1)
                        LEFT JOIN
                            friends f ON (u.id = f.receiver_id AND f.sender_id = $1) 
                                        OR (u.id = f.sender_id AND f.receiver_id = $1)
                        LEFT JOIN
                            requests r ON (u.id = r.receiver_id AND r.sender_id = $1) 
                                        OR (u.id = r.sender_id AND r.receiver_id = $1)
                        WHERE
                            u.id = $2;
                            `
        return await db.get(sql, [id, userId]);
    },

    getUserProfile: async (id: number) => {
        return await db.get('SELECT u.id, u.username, u.display_name FROM users u WHERE id = ?', [id]);
    },

    // get last message for each contact
    getContactList: async (userId: number) => {
        const sql: string = `SELECT users.id, users.display_name, users.username 
                            from contacts 
                            INNER JOIN users on contacts.contact_id = users.id and contacts.user_id = ?`;
        return await db.all(sql, [userId]);
    },

    getMessages: async (senderId: number, receiverId: number) => {

        const sql: string = `SELECT * FROM messages 
                             WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`;
        return await db.all(sql, [senderId, receiverId, receiverId, senderId]);
    },

    getFriends: async (userId: number) => {
        const sql: string = `SELECT u.id,
                            u.display_name
                            from users u
                            inner join friends f on f.sender_id = u.id 
                            WHERE f.receiver_id = $1
                            UNION
                            SELECT u.id,
                            u.display_name
                            from users u
                            inner join friends f on f.receiver_id= u.id 
                            WHERE f.sender_id = $1
                            `;
        return await db.all(sql, [userId]);
    },

    findFriends: async (userId: number, search: string) => {
        const sql: string = `SELECT u.id,
                            u.display_name
                            from users u
                            inner join friends f on f.sender_id = u.id 
                            WHERE f.receiver_id = $1 AND (u.display_name LIKE $2 OR u.username LIKE $2)
                            UNION
                            SELECT u.id,
                            u.display_name
                            from users u
                            inner join friends f on f.receiver_id= u.id 
                            WHERE f.sender_id = $1 AND (u.display_name LIKE $2 OR u.username LIKE $2)
                            `;
        const searchTermWithWildcards = `%${search}%`;
        return await db.all(sql, [userId, searchTermWithWildcards]);

    },

    findUsers: async (search: string) => {
        const sql: string = "SELECT id, username, display_name FROM users WHERE username LIKE $1 OR display_name LIKE $1";
        const searchTermWithWildcards = `%${search}%`;
        return await db.all(sql, [searchTermWithWildcards]);
    },

    //TODO: implement chat requests 
    getChatRequests: async (userId: number) => {
        const sql: string = `SELECT * from chat_requests`;
        return await db.all(sql, [userId]);
    },

    createFriendRequests: async (senderId: number, receiverId: number) => {
        const sql: string = `INSERT OR IGNORE into requests(sender_id, receiver_id, request_type) values(?, ?, ?)`
        const result = await db.run(sql, [senderId, receiverId, 'friend'])
        return result.changes > 0;
    },

    deleteFriendRequest: async (reqId: number, userId: number) => {
        const sql = `DELETE FROM requests WHERE id=? and sender_id = ?`
        const result = await db.run(sql, [reqId, userId])
        assert(result.changes <= 1, "THIS IS BIG PROBLEM")
        return result.changes > 0;
    },


    getFriendRequests: async (userId: number) => {
        const sql: string = `
                            SELECT r.id req_id, u.id, u.display_name, r.request_type,
                            CASE
                                WHEN u.id = r.receiver_id THEN 'sent'
                                ELSE 'received'
                            END AS request_type 
                            FROM users u
                            JOIN requests r
                            ON r.receiver_id=u.id and r.sender_id=$1
                            OR r.sender_id=u.id and r.receiver_id=$1
                            WHERE r.request_type = 'friend'
                            `;
        return await db.all(sql, [userId]);
    },

    acceptFriendRequest: async (reqId: number, userId: number) => {

        const result = userRepository.deleteFriendRequest(reqId, userId);
        if (!result) {
            return false;
        }

        const sql: string = `INSERT INTO friends (sender_id, receiver_id)  VALUES (?, ?)`;
        const insertResult = await db.run(sql, [reqId]);
        assert(insertResult.changes <= 1, "THIS IS BIG PROBLEM");
        return insertResult.changes > 0;
    }
}

