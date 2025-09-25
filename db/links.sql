-- Supprime la table si elle existe déjà
-- DROP TABLE IF EXISTS links;

-- Crée la table links avec SQLite-compatible types
CREATE TABLE IF NOT EXISTS links (
  short TEXT PRIMARY KEY,
  long TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now', 'utc')) NOT NULL, 
  visits INTEGER DEFAULT 0 NOT NULL
);