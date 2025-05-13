import db from './db.js'

const UserDB = {
    getUserByUsername: async (username) => {
        return await db.get('SELECT * FROM users WHERE username = ?', [username]);
    },

    getUserById: async (id) => {
        return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    },

    createUser: async (user) => {
        const { username, full_name, password, email } = user;
        return await db.run('INSERT INTO users (username, full_name, password, email) VALUES (?, ?, ?, ?)', [username, full_name, password, email]);
    }
}

export default UserDB
