import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

import db from './db.js'

db.serialize( async () => {
    // Create the users table

    // Insert a user into the users table
    const createUsers = db.prepare('INSERT INTO users (username, full_name, password, email) VALUES ( ?, ?, ?, ?)')
    // const createMessages = db.prepare('INSERT INTO message (sender_id, receiver_id, content) VALUES (?,  ?, ?)')
    const salt = await bcrypt.genSalt(10)
    for (let i = 0;i<5;i++) {
        createUsers.run(
            faker.internet.username(),
            faker.person.fullName(),
            await bcrypt.hash('password', salt),
            faker.internet.email()
        )
    }
    createUsers.finalize()
    const users = await db.all('SELECT * FROM users')
    console.log(users)
})
