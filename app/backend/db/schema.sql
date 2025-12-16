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


-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK(mode IN ('local', 'remote', 'ai', 'tournament')),
    status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'playing', 'finished', 'cancelled')),
    winner_id INTEGER,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Game players table
CREATE TABLE IF NOT EXISTS game_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    user_id INTEGER,
    position INTEGER NOT NULL CHECK(position IN (1, 2)),
    score INTEGER DEFAULT 0,
    is_ai INTEGER DEFAULT 0 NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(game_id, position)
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'registration' CHECK(status IN ('registration', 'active', 'finished', 'cancelled')),
    created_by INTEGER NOT NULL,
    winner_id INTEGER,
    max_players INTEGER NOT NULL CHECK(max_players IN (4, 8, 16, 32, 64)),
    current_round INTEGER DEFAULT 1,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tournament players table
CREATE TABLE IF NOT EXISTS tournament_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    seed INTEGER NOT NULL,
    eliminated INTEGER DEFAULT 0,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(tournament_id, user_id),
    UNIQUE(tournament_id, seed)
);

-- Tournament matches table
CREATE TABLE IF NOT EXISTS tournament_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    player1_id INTEGER,
    player2_id INTEGER,
    winner_id INTEGER,
    game_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'playing', 'completed')),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES tournament_players(id) ON DELETE SET NULL,
    FOREIGN KEY (player2_id) REFERENCES tournament_players(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES tournament_players(id) ON DELETE SET NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL,
    UNIQUE(tournament_id, round, match_number)
);

CREATE TABLE IF NOT EXISTS player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    elo_rating INTEGER DEFAULT 1000 NOT NULL,
    rank TEXT DEFAULT 'Silver' NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ELO history table
CREATE TABLE IF NOT EXISTS elo_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER,
    elo_change INTEGER NOT NULL,
    new_elo INTEGER NOT NULL,
    result TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL
);



-- Indexes for performance optimization

CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_mode ON games(mode);
CREATE INDEX IF NOT EXISTS idx_game_players_user ON game_players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_players_game ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament ON tournament_players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament ON tournament_matches(tournament_id);
