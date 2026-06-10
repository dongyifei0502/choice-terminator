CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'user',
    banned      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS questions (
    id          TEXT PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id),
    category    TEXT NOT NULL,
    text        TEXT NOT NULL,
    weight      INTEGER NOT NULL DEFAULT 2,
    enabled     INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS history (
    id            TEXT PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    category      TEXT,
    options       TEXT NOT NULL,
    questions     TEXT,
    scores        TEXT,
    final_scores  TEXT,
    recommendation TEXT,
    reason        TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS config (
    key   TEXT PRIMARY KEY,
    value TEXT
);
