ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id);
ALTER TABLE comments ADD COLUMN is_author INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS comments_parent ON comments (parent_id);
