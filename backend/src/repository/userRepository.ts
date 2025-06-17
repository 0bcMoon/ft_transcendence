
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
    getUserById: async (id: number) => {
        return await db.get('SELECT  u.id, u.username, u.display_name FROM users u WHERE id = ?', [id]);
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
        const sql: string = `SELECT u.id, u.display_name from users u
                             inner join friends f on f.sender_id = u.id and f.receiver_id = $1
                            UNION
                            SELECT u.id, u.display_name from users u
                            inner join friends f on f.receiver_id= u.id and f.sender_id = $1
                            `;
        return await db.all(sql, [userId]);
    },

    //TODO: implement chat requests 

    getChatRequests: async (userId: number) => {
        const sql: string = `SELECT * from chat_requests`;
        return await db.all(sql, [userId]);
    }
    //
    // createUser: async (user) => {
    //     const { username, full_name, password, email } = user;
    //     return await db.run('INSERT INTO users (username, full_name, password, email) VALUES (?, ?, ?, ?)', [username, full_name, password, email]);
    // }
}
