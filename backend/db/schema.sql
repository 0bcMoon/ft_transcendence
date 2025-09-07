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


CREATE TABLE IF NOT EXISTS "contacts" (
    "id" INTEGER,
    "user_id" INT NOT NULL,
    "contact_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contact_id) REFERENCES users(id),
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


CREATE TABLE IF NOT EXISTS "games" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL CHECK(mode IN ('local_1v1', 'remote_1v1', 'multiplayer', 'tournament')),
    "status" TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'in-progress', 'finished')),
    "max_players" INTEGER NOT NULL,
    "duration" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "game_players" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "game_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "team" TEXT DEFAULT NULL,
    "position" TEXT DEFAULT NULL,
    "score" INTEGER DEFAULT 0,
    "goals_scored" INTEGER DEFAULT 0,
    "goals_conceded" INTEGER DEFAULT 0,
    "accuracy" REAL DEFAULT 0,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "user_stats" (
    "user_id" INTEGER PRIMARY KEY,
    "total_matches" INTEGER DEFAULT 0,
    "wins" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    "win_rate" REAL DEFAULT 0,
    "avg_score" REAL DEFAULT 0,
    "playtime" INTEGER DEFAULT 0,
    "longest_win_streak" INTEGER DEFAULT 0,
    "current_win_streak" INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
