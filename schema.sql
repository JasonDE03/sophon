CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY,
  episode TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  lang TEXT,
  created_at INTEGER NOT NULL,
  ip_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_episode_created ON comments (episode, created_at);
CREATE INDEX IF NOT EXISTS comments_ip_created ON comments (ip_hash, created_at);
