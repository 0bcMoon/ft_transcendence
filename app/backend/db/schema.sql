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
    UNIQUE(user_id, blocked_user_id),
    PRIMARY KEY("id" AUTOINCREMENT)
);

------------------------Games---------------------

CREATE TABLE IF NOT EXISTS games (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL CHECK(mode IN ('ai','local','remote','tournament')),
    "status" TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','playing','finished','cancelled')),
    "winner_id" INTEGER,
    "started_at" TIMESTAMP,
    "ended_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_games_mode   ON games(mode);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_winner ON games(winner_id);


CREATE TABLE IF NOT EXISTS game_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,   -- References games(id)
    user_id INTEGER,            -- References users(id), NULL if AI
    position INTEGER NOT NULL,  -- 1 = left, 2 = right, etc.
    score INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, position),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gp_game ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_gp_user ON game_players(user_id);

-- Tournaments: All tournament events
CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'registration' CHECK(status IN ('registration','active','finished','cancelled')),
    winner_id INTEGER,          -- References users(id)
    max_players INTEGER NOT NULL DEFAULT 8,
    current_round INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_winner ON tournaments(winner_id);

-- Tournament Players: Who joined each tournament
CREATE TABLE IF NOT EXISTS tournament_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,   -- References tournaments(id)
    user_id INTEGER NOT NULL,         -- References users(id)
    alias TEXT NOT NULL,              -- Nickname in tournament
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','eliminated','winner')),
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id),
    UNIQUE(tournament_id, alias),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tp_tournament ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tp_user ON tournament_players(user_id);

-- Tournament Games: Which games are in which tournament/round/order
CREATE TABLE IF NOT EXISTS tournament_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,   -- References tournaments(id)
    game_id INTEGER NOT NULL,         -- References games(id)
    round INTEGER NOT NULL,
    match_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, game_id),
    UNIQUE(tournament_id, round, match_order),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tg_round ON tournament_games(tournament_id, round, match_order);
CREATE INDEX IF NOT EXISTS idx_tg_game  ON tournament_games(game_id);
