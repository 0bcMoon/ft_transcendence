ALTER TABLE games
ADD COLUMN IF NOT EXISTS game_type VARCHAR(32) NOT NULL DEFAULT 'pong';

CREATE INDEX IF NOT EXISTS idx_games_game_type ON games (game_type);
CREATE INDEX IF NOT EXISTS idx_games_mode_type ON games (mode, game_type);
