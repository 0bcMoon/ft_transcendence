CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER,
	"username"	VARCHAR(64) UNIQUE NOT NULL,
    "display_name" VARCHAR(64) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "profile_picture" TEXT  DEFAULT '',
    "image_src" TEXT NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "oauth_type" TEXT NOT NULL DEFAULT 'local',
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);

 

CREATE TABLE IF NOT EXISTS "messages" (
    "id" INTEGER,
    "sender_id" INT NOT NULL,
    "receiver_id" INT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE INDEX IF NOT EXISTS idx_messages_createdat ON messages(created_at);

CREATE TABLE IF NOT EXISTS "contacts" (
    "id" INTEGER,
    "user_id" INT NOT NULL,
    "contact_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contact_id) REFERENCES users(id),
    UNIQUE(user_id, contact_id)
	PRIMARY KEY("id" AUTOINCREMENT)
);


CREATE TABLE IF NOT EXISTS "requests" (
    "id" INTEGER,
    "sender_id" INT NOT NULL,
    "receiver_id" INT NOT NULL,
    "request_type" TEXT NOT NULL CHECK(request_type IN ('chat', 'friend')),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    UNIQUE(sender_id, receiver_id, request_type)
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "friends" (
    "id" INTEGER,
    "sender_id" INT NOT NULL,
    "receiver_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
	PRIMARY KEY("id" AUTOINCREMENT)
);


CREATE TABLE IF NOT EXISTS "blocks" (
    "id" INTEGER,
    "user_id" INT NOT NULL,
    "blocked_user_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (blocked_user_id) REFERENCES users(id),
	PRIMARY KEY("id" AUTOINCREMENT)
);
-- -------------------- Game schema ------------------

CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_display_name" ON "users" ("display_name");

CREATE TABLE IF NOT EXISTS "matches" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "match_uuid" TEXT UNIQUE NOT NULL,
    "player_left_id" INT NOT NULL,
    "player_right_id" INT NOT NULL,
    "winner_id" INT,
    "left_score" INT DEFAULT 0,
    "right_score" INT DEFAULT 0,
    "status" TEXT NOT NULL CHECK(status IN ('waiting','playing','ended')) DEFAULT 'waiting',
    "started_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP,
    FOREIGN KEY (player_left_id) REFERENCES users(id),
    FOREIGN KEY (player_right_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS "game_events" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "match_id" INT NOT NULL,
    "event_type" TEXT NOT NULL, -- e.g. 'score', 'pause', 'resume'
    "event_data" TEXT, -- JSON blob for details
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id)
);


CREATE TABLE IF NOT EXISTS "leaderboard" (
    "user_id" INT PRIMARY KEY,
    "games_played" INT DEFAULT 0,
    "games_won" INT DEFAULT 0,
    "games_lost" INT DEFAULT 0,
    "highest_score" INT DEFAULT 0,
    "last_played" TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
