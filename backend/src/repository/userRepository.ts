
import { rejects } from 'assert';
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
        const sql: string = `
                    SELECT u.id, u.display_name,
                    CASE
                        WHEN b.blocked_user_id is NOT NULL THEN 'blocked'
                        ELSE 'none'
                    END AS relation_status 
                    FROM users u
                    JOIN blocks b
                    on u.id = b.blocked_user_id AND b.user_id=$1 AND u.id=$2
                    UNION
                    SELECT u.id,
                    u.display_name,
                    CASE
                        WHEN f.sender_id is NOT NULL THEN 'friend'
                        ELSE 'none'
                    END AS relation_status
                    FROM users u
                    INNER JOIN friends f ON f.receiver_id= u.id and f.sender_id = $1 and u.id=$2
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
        const isBlock = await userRepository.isBlocked(senderId, receiverId)
        if (isBlock.length > 0)
            return false
        const isFriend = await userRepository.isFriend(senderId, receiverId)
        if (isFriend.length > 0)
            return false
        const sql: string = `insert into requests(sender_id, receiver_id, request_type) values(?, ?, ?)`
        const result = await db.run(sql, [senderId, receiverId, 'friend'])
        console.log(result)
        return true

    },
    isBlocked: async (userX: number, userY: number) => {
        const sql: string = `
                            SELECT id FROM blocks
                            WHERE (user_id=$1 AND blocked_user_id=$2) 
                            OR (user_id=$2 AND blocked_user_id=$1)
                            `
        return await db.all(sql, [userX, userY])
    },
    isFriend: async (userX: number, userY: number) => {

        const sql: string = `
                            select id from friends
                            where (sender_id=$1 and receiver_id=$2) or (sender_id=$2 and receiver_id=$1)
                            `
        return await db.all(sql, [userX, userY])
    },
}

