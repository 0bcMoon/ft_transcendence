import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import db from './db';

db.serialize(async () => {
    // Prepare statements for existing tables
    const createUsers = db.prepare(`
        INSERT INTO users (username, display_name, password, image_src, profile_picture, email)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertFriends = db.prepare(`INSERT INTO friends (sender_id, receiver_id) VALUES (?, ?)`);

    const insertContact = db.prepare(`INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)`);

    const createMessages = db.prepare(`
        INSERT INTO messages (sender_id, receiver_id, content)
        VALUES (?, ?, ?)
    `);

    const createBlocks = db.prepare(`INSERT INTO blocks (user_id, blocked_user_id) VALUES (?, ?)`);

    const salt = await bcrypt.genSalt(10);

    // Create some fixed users
    const fixedUsers = [
        ["hicham", "Hicham Benoukaiss", "hicham@mail.com"],
        ["mregrag", "Mohamed Regrag", "mohamed@mail.com"],
        ["zaid", "Zaid kotbi", "zaid@mail.com"],
        ["microb", "khona microb", "microb@mail.com"],
        ["zeko", "zakaria", "zakaria@mail.com"],
        ["joulan", "joulan", "joulan@mail.com"],
        ["user1", "khona microb", "user1@mail.com"],
        ["user2", "khona microb", "user2@mail.com"],
        ["user3", "khona microb", "user3@mail.com"],
        ["user4", "khona microb", "user4@mail.com"],
        ["hmouda", "Mohammed El Bouazizi", faker.internet.email()]
    ];

    for (const [username, displayName, email] of fixedUsers) {
        createUsers.run(
            username,
            displayName,
            await bcrypt.hash('password', salt),
            '/public/',
            'default.jpg',
            email
        );
    }

    // Create random users
    for (let i = 0; i < 12; i++) {
        createUsers.run(
            faker.internet.username(),
            faker.person.fullName(),
            await bcrypt.hash(faker.internet.password(), salt),
            '/public/',
            'default.jpg',
            faker.internet.email()
        );
    }

    // Example contacts, blocks, friends, messages
    insertContact.run(1, 2);
    insertContact.run(1, 3);
    insertContact.run(2, 3);
    insertContact.run(2, 1);

    insertContact.run(1, 4);
    insertContact.run(1, 5);

    createBlocks.run(1, 4);
    createBlocks.run(5, 1);

    insertFriends.run(1, 2);
    insertFriends.run(1, 3);


    for (let i = 0; i < 10; i++) {
        createMessages.run(1, 4, faker.lorem.sentence());
        createMessages.run(4, 1, faker.lorem.sentence());
    }
    for (let i = 0; i < 10; i++) {
        createMessages.run(1, 5, faker.lorem.sentence());
        createMessages.run(5, 1, faker.lorem.sentence());
    }

    for (let i = 0; i < 10; i++) {
        createMessages.run(1, 2, faker.lorem.sentence());
        createMessages.run(2, 1, faker.lorem.sentence());
    }

    createUsers.finalize();
});

