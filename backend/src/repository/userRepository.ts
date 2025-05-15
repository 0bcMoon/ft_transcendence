
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

    getUserByUsername: async (username: string): Promise<User | undefined> => {
        return await db.get('SELECT * FROM users WHERE username = ?', [username]);
    },
    getUserById: async (id: number) => {
        return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    },
    // createUser: async (user) => {
    //     const { username, full_name, password, email } = user;
    //     return await db.run('INSERT INTO users (username, full_name, password, email) VALUES (?, ?, ?, ?)', [username, full_name, password, email]);
    // }
}
