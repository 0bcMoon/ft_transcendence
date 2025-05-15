import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import 'dotenv/config';

import db from './db'

db.serialize(async () => {

    //truncate the tables
    db.exec('DELETE FROM users')
    const createUsers = db.prepare('INSERT INTO users (username, display_name, password, email) VALUES ( ?, ?, ?, ?)')
    // const createMessages = db.prepare('INSERT INTO message (sender_id, receiver_id, content) VALUES (?,  ?, ?)')
    const salt = await bcrypt.genSalt(10)
    createUsers.run(
        "hicham",
        "Hicham Benoukaiss",
        await bcrypt.hash('password', salt),
        "hicham@mail.com"
    )
    for (let i = 0; i < 5; i++) {
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
