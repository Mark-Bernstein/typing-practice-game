CREATE TABLE IF NOT EXISTS high_scores (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  letters_correct INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  time_played INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_score ON high_scores(score DESC);
CREATE INDEX idx_created_at ON high_scores(created_at DESC);

-- Total plays
CREATE TABLE IF NOT EXISTS game_stats (
  id SERIAL PRIMARY KEY,
  total_plays INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize the counter
INSERT INTO game_stats (total_plays)
SELECT 0
WHERE NOT EXISTS (SELECT 1 FROM game_stats);
