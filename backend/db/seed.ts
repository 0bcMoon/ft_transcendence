import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import 'dotenv/config';

import db from './db'

db.serialize(async () => {

    //truncate the tables
    db.exec('DELETE FROM users')
    const createUsers = db.prepare('INSERT INTO users (username, display_name, password, email) VALUES ( ?, ?, ?, ?)')
    const insertContact = db.prepare('INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)')
    const createMessages = db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)')

    // const createMessages = db.prepare('INSERT INTO message (sender_id, receiver_id, content) VALUES (?,  ?, ?)')
    const salt = await bcrypt.genSalt(10)
    createUsers.run(
        "hicham",
        "Hicham Benoukaiss",
        await bcrypt.hash('password', salt),
        "hicham@mail.com"
    )

    createUsers.run(
        "jebli",
        "Mohamed Regrag",
        await bcrypt.hash('password', salt),
        "mohamed@mail.com"
    )

    for (let i = 0; i < 4; i++) {
        createUsers.run(
            faker.internet.username(),
            faker.person.fullName(),
            await bcrypt.hash('password', salt),
            faker.internet.email()
        )
    }
    insertContact.run(1, 2)
    insertContact.run(1, 3)
    insertContact.run(2, 3)
    insertContact.run(2, 1)

    createMessages.run(1, 2, faker.lorem.sentence())
    createMessages.run(2, 1, faker.lorem.sentence())
    createMessages.run(1, 2, faker.lorem.sentence())
    createMessages.run(2, 1, faker.lorem.sentence())
    createMessages.run(1, 2, faker.lorem.sentence())
    createMessages.run(2, 1, faker.lorem.sentence())
    createMessages.run(1, 2, faker.lorem.sentence())
    createMessages.run(1, 2, faker.lorem.sentence())
    createMessages.run(1, 2, faker.lorem.sentence())
    createMessages.run(1, 2, faker.lorem.sentence())


    createUsers.finalize()
    const users = await db.all('SELECT * FROM contacts')
    console.log(users)
})
