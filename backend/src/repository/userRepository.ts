import assert from 'assert';
import db from '../../db/db';

export interface User {
    id: number,
    username: string,
    display_name: string,
    password: string,
    email: string,
    image_src: string | undefined,
    profile_picture: string,
    relation_status: string
    created_at: Date,
}


export const userRepository = {

    getUserByUsername: async (username: string): Promise<User | undefined> => {
        return await db.get('SELECT * FROM users WHERE username = ?', [username]);
    },

    getAllUsers: async (id: number): Promise<User[] | undefined> => {
        // const query: string = `SELECT
        const query = `SELECT 
                        u.id,
                        u.display_name,
                        u.username,
                        u.profile_picture,
                        u.image_src
                    FROM users u 
                    WHERE u.id != $1`
        return await db.all(query, [id]);
    },

    getCurrentUserById: async (id: number): Promise<User | undefined> => {
        return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    },

    getUserById: async (id: number, user_id: number): Promise<User | undefined> => {
        const query: string = `
                        SELECT
                            u.id,
                            u.display_name,
                            u.username,
                            u.profile_picture,
                            u.image_src,
                            r.id req_id,
                            CASE
                                WHEN b.user_id = $1 THEN 'blocking'
                                WHEN b.user_id = $2 THEN 'blocked_by'
                                WHEN f.sender_id IS NOT NULL THEN 'friend' -- friendship is bidirectional
                                WHEN r.sender_id = $1 THEN 'pending' -- request sent by the user
                                WHEN r.receiver_id = $1 THEN 'waiting' -- request received by the user
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
        return await db.get(query, [id, user_id]);
    },

    getUserProfile: async (id: number) => {
        return await db.get('SELECT u.id, u.username, u.display_name FROM users u WHERE id = ?', [id]);
    },

    // get last message for each contact
    getContactList: async (user_id: number) => {
        const query: string = `SELECT users.id, users.display_name, users.username 
                            from contacts 
                            INNER JOIN users on contacts.contact_id = users.id and contacts.user_id = ?`;
        return await db.all(query, [user_id]);
    },

    getMessages: async (senderId: number, receiverId: number) => {

        const query: string = `SELECT * FROM messages 
                             WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`;
        return await db.all(query, [senderId, receiverId, receiverId, senderId]);
    },

    getFriends: async (user_id: number) => {
        const query: string = `SELECT u.id, u.display_name, u.profile_picture, u.image_src
                            FROM users u
                            INNER join friends f on f.sender_id = u.id 
                            WHERE f.receiver_id = $1
                            UNION
                            SELECT u.id, u.display_name, u.profile_picture, u.image_src
                            FROM users u
                            INNER join friends f on f.receiver_id= u.id 
                            WHERE f.sender_id = $1
                            `;
        return await db.all(query, [user_id]);
    },

    findFriends: async (user_id: number, search: string) => {
        const query: string = `SELECT u.id, u.display_name, u.profile_picture, u.image_src
                            FROM users u
                            INNER join friends f on f.sender_id = u.id 
                            WHERE f.receiver_id = $1 AND (u.display_name LIKE $2 OR u.username LIKE $2)

                            UNION

                            SELECT u.id, u.display_name, u.profile_picture, u.image_src
                            FROM users u
                            INNER join friends f on f.receiver_id= u.id 
                            WHERE f.sender_id = $1 AND (u.display_name LIKE $2 OR u.username LIKE $2)
                            `;
        const searchTermWithWildcards = `%${search}%`;
        return await db.all(query, [user_id, searchTermWithWildcards]);

    },
    findUsers: async (search: string): Promise<User[] | undefined> => {
        const query: string = `SELECT id,
                            username,
                            display_name,
                            profile_picture,
                            image_src
                            FROM users WHERE username LIKE $1 OR display_name LIKE $1`;
        const searchTermWithWildcards = `%${search}%`;
        return await db.all(query, [searchTermWithWildcards]);
    },

    //TODO: implement chat requests 
    getChatRequests: async (user_id: number) => {
        const query: string = `SELECT * from chat_requests`;
        return await db.all(query, [user_id]);
    },

    createFriendRequests: async (senderId: number, receiverId: number) => {
        const query: string = `INSERT OR IGNORE into requests(sender_id, receiver_id, request_type) values(?, ?, ?)`
        const result = await db.run(query, [senderId, receiverId, 'friend'])
        return result.changes > 0;
    },

    cancelFriendRequest: async (req_id: number, user_id: number) => {
        const query = `DELETE FROM requests WHERE id=? and sender_id = ?`
        const result = await db.run(query, [req_id, user_id])
        assert(result.changes <= 1, "THIS IS BIG PROBLEM")
        return result.changes > 0;
    },

    deleteFriendRequest: async (req_id: number, user_id: number) => {
        const query = `DELETE FROM requests WHERE id=? and receiver_id = ?`
        const result = await db.run(query, [req_id, user_id])
        assert(result.changes <= 1, "THIS IS BIG PROBLEM")
        return result.changes > 0;
    },


    getFriendRequests: async (user_id: number) => {
        const query: string = `
                            SELECT 
                            r.id req_id,
                            u.id,
                            u.display_name,
                            r.request_type,
                            u.profile_picture,
                            u.image_src,
                            u.username,
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
        return await db.all(query, [user_id]);
    },

    acceptFriendRequest: async (req_id: number, user_id: number, other_user_id: number) => {

        const result = await userRepository.deleteFriendRequest(req_id, user_id);
        if (!result) {
            return false;
        }
        const query: string = `INSERT INTO friends (sender_id, receiver_id)  VALUES (?, ?)`;
        const insertResult = await db.run(query, [other_user_id, user_id]);
        assert(insertResult.changes == 1, "THIS IS BIG PROBLEM");
        return insertResult.changes > 0;
    },
    unblockUser: async (user_id: number, blocked_user_id: number) => {
        const query: string = `DELETE FROM blocks WHERE user_id = ? AND blocked_user_id = ?`;
        const result = await db.run(query, [user_id, blocked_user_id]);
        assert(result.changes == 1, "THIS IS BIG PROBLEM"); // this assertion ensures that exactly one row is deleted and will get removed in production
        return result.changes > 0;
    },
    blockUser: async (user_id: number, blocked_user_id: number) => {
        const query: string = `INSERT INTO blocks (user_id, blocked_user_id) VALUES (?, ?)`;
        const result = await db.run(query, [user_id, blocked_user_id]);
        assert(result.changes == 1, "THIS IS BIG PROBLEM"); // this assertion ensures that exactly one row is inserted and will get removed in production
        return result.changes > 0;
    },
    deleteFriendship: async (user_id: number, friend_id: number) => {
        const query: string = `DELETE FROM friends WHERE (sender_id = $1 AND receiver_id = $2) 
                                                        OR (sender_id = $2 AND receiver_id = $1)`;

        const result = await db.run(query, [user_id, friend_id]);
        assert(result.changes == 1, "THIS IS BIG PROBLEM"); // this assertion ensures that at most one row is deleted and will get removed in production
        return result.changes > 0;
    },
    deleteRequests: async (user_id: number, block_user_id: number) => {
        /// Deletes both sent and received requests between two users include chat requests
        const query: string = `DELETE FROM requests 
                            WHERE (sender_id = $1 AND receiver_id = $2)
                            OR (sender_id = $2 AND receiver_id = $1)`;
        const result = await db.run(query, [user_id, block_user_id]);
        assert(result.changes >= 1, "THIS IS BIG PROBLEM");
        return result.changes > 0;
    },
    getBlockedUsers: async (user_id: number): Promise<User[] | undefined> => {

        const query: string = `SELECT u.id, u.display_name, u.username , u.profile_picture, u.image_src
                            FROM users u
                            JOIN blocks b ON u.id = b.blocked_user_id
                            WHERE b.user_id = $1`;
        return db.all(query, [user_id]);
    },

    updateProfilePicture: async (user_id: number, picture_url: string): Promise<string | undefined | null> => {

        const user = await userRepository.getCurrentUserById(user_id);
        if (!user) {
            return undefined; // User not found
        }

        const query: string = `UPDATE users SET profile_picture = ? WHERE id = ?`;
        await db.run(query, [picture_url, user_id]);
        return user?.profile_picture;
    }

}

