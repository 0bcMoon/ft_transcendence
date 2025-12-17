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

    // Prepare statements for new game tables
    // const createMatch = db.prepare(`
    //     INSERT INTO matches (match_uuid, player_left_id, player_right_id, winner_id, left_score, right_score, status, started_at, ended_at)
    //     VALUES (?, ?, ?, ?, ?, ?, 'ended', ?, ?)
    // `);
    //
    // const createEvent = db.prepare(`
    //     INSERT INTO game_events (match_id, event_type, event_data)
    //     VALUES (?, ?, ?)
    // `);
    //
    // const updateLeaderboard = db.prepare(`
    //     INSERT INTO leaderboard (user_id, games_played, games_won, games_lost, highest_score, last_played)
    //     VALUES (?, ?, ?, ?, ?, ?)
    //     ON CONFLICT(user_id) DO UPDATE SET
    //         games_played = games_played + excluded.games_played,
    //         games_won = games_won + excluded.games_won,
    //         games_lost = games_lost + excluded.games_lost,
    //         highest_score = MAX(highest_score, excluded.highest_score),
    //         last_played = excluded.last_played
    // `);

    const salt = await bcrypt.genSalt(10);

    // Create some fixed users
    const fixedUsers = [
        ["hicham", "Hicham Benoukaiss", "hicham@mail.com"],
        ["mregrag", "Mohamed Regrag", "mohamed@mail.com"],
        ["zaid", "Zaid kotbi", "zaid@mail.com"],
        ["microb", "khona microb", "microb@mail.com"],
        ["zeko", "zakaria", "zakaria@mail.com"],
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
            'http://localhost:3000/public/',
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
            'http://localhost:3000/public/',
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

    // // === Generate random matches ===
    // const totalMatches = 20;
    // for (let i = 0; i < totalMatches; i++) {
    //     const leftId = faker.number.int({ min: 1, max: 20 });
    //     let rightId = faker.number.int({ min: 1, max: 20 });
    //     while (rightId === leftId) {
    //         rightId = faker.number.int({ min: 1, max: 20 });
    //     }
    //
    //     const leftScore = faker.number.int({ min: 0, max: 10 });
    //     const rightScore = faker.number.int({ min: 0, max: 10 });
    //     const winnerId = leftScore > rightScore ? leftId : rightId;
    //
    //     const matchUuid = `match_${Date.now()}_${faker.string.alphanumeric(4)}`;
    //     const startedAt = faker.date.past();
    //     const endedAt = faker.date.between({ from: startedAt, to: new Date() });
    //
    //     // Insert match
    //     createMatch.run(
    //         matchUuid,
    //         leftId,
    //         rightId,
    //         winnerId,
    //         leftScore,
    //         rightScore,
    //         startedAt.toISOString(),
    //         endedAt.toISOString()
    //     );
    //
    //     const matchRow = await db.get(`SELECT id FROM matches WHERE match_uuid=?`, [matchUuid]);
    //
    //     // Insert some events for this match
    //     createEvent.run(matchRow.id, 'start', null);
    //     createEvent.run(matchRow.id, 'score', JSON.stringify({ scorer: 'left', score: leftScore }));
    //     createEvent.run(matchRow.id, 'score', JSON.stringify({ scorer: 'right', score: rightScore }));
    //     createEvent.run(matchRow.id, 'end', null);
    //
    //     // Update leaderboard for both players
    //     updateLeaderboard.run(leftId, 1, winnerId === leftId ? 1 : 0, winnerId === leftId ? 0 : 1, leftScore, endedAt.toISOString());
    //     updateLeaderboard.run(rightId, 1, winnerId === rightId ? 1 : 0, winnerId === rightId ? 0 : 1, rightScore, endedAt.toISOString());
    // }

    createUsers.finalize();
    // console.log(" Seed data inserted for users, friends, messages, and games");
});

