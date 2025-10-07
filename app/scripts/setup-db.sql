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