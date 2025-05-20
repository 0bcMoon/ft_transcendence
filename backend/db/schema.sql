
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER,
	"username"	VARCHAR(64),
    "display_name" VARCHAR(64) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
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

-- like friend but for messages
-- may be add group chat later will see

CREATE TABLE IF NOT EXISTS "contacts" (
    "id" INTEGER,
    "user_id" INT NOT NULL,
    "contact_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contact_id) REFERENCES users(id),
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "friend" (
    "id" INTEGER,
    "sender_id" INT NOT NULL,
    "receiver_id" INT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
	PRIMARY KEY("id" AUTOINCREMENT)
);
