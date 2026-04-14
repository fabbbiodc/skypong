import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { hasColumn, addColumnIfMissing } from "../utils/helpers";

const profileDataDir =
  process.env.PROFILE_DATA_DIR?.trim() || path.resolve(process.cwd(), "data");

const profileDbPath =
  process.env.PROFILE_DB_PATH?.trim() ||
  path.join(profileDataDir, "profile.db");

fs.mkdirSync(path.dirname(profileDbPath), { recursive: true });

const db = new sqlite3.Database(
  profileDbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Failed to connect to SQLite", err);
    } else {
      console.log("Connected to SQLite", profileDbPath);
    }
  },
);
function run(db: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => (err ? reject(err) : resolve()));
  });
}

export async function initProfileDB(): Promise<void> {
  try {
    await run(db, "PRAGMA journal_mode = WAL");
    await run(db, "PRAGMA foreign_keys = ON");

    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS players (
        user_id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        avatarUrl TEXT,
        winPhrase TEXT,
        localization TEXT DEFAULT 'es',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        deleted INTEGER NOT NULL DEFAULT 0,
        deleted_at TEXT,
        last_access_at TEXT DEFAULT '2025-12-01',
        logged INTEGER DEFAULT 0,
		access_expires_at TEXT DEFAULT '2025-12-01'
      )
    `,
    );

    await run(
      db,
      `
      CREATE UNIQUE INDEX IF NOT EXISTS players_nickname_unique
      ON players(nickname)
    `,
    );

    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS player_stats (
        user_id TEXT PRIMARY KEY,
        played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        winrate REAL DEFAULT 0,
        rate INTEGER DEFAULT 0,
        updated_at TEXT,
        FOREIGN KEY(user_id) REFERENCES players(user_id) ON DELETE CASCADE
      )
    `,
    );

    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS player_ai_stats (
        user_id TEXT PRIMARY KEY,
        played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        winrate REAL DEFAULT 0,
        rate INTEGER DEFAULT 0,
        updated_at TEXT,
        FOREIGN KEY(user_id) REFERENCES players(user_id) ON DELETE CASCADE
      )
    `,
    );

    await run(
      db,
      `
      CREATE INDEX IF NOT EXISTS idx_stats_user
      ON player_stats(user_id)
    `,
    );

    await run(
      db,
      `
      CREATE INDEX IF NOT EXISTS idx_stats_user_ai
      ON player_ai_stats(user_id)
    `,
    );

    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS processed_games (
        game_id TEXT PRIMARY KEY,
        processed_at TEXT
      )
    `,
    );

    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id TEXT NOT NULL,
        user2_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'blocked')),
        requester_id TEXT NOT NULL,
        blocked_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        CHECK (user1_id < user2_id),
        CHECK (user1_id != user2_id),
        FOREIGN KEY(user1_id) REFERENCES players(user_id) ON DELETE CASCADE,
        FOREIGN KEY(user2_id) REFERENCES players(user_id) ON DELETE CASCADE,
        FOREIGN KEY(requester_id) REFERENCES players(user_id) ON DELETE CASCADE,
        FOREIGN KEY(blocked_by) REFERENCES players(user_id) ON DELETE CASCADE,
        UNIQUE(user1_id, user2_id)
      )
    `,
    );

    await run(
      db,
      `
      CREATE INDEX IF NOT EXISTS idx_players_stats_updated
      ON player_stats(updated_at)
    `,
    );

    await run(
      db,
      `
      CREATE INDEX IF NOT EXISTS friends_request_time
      ON friends(created_at)
    `,
    );

    console.log("[profile] Database initialized safely");
  } catch (err) {
    console.error("[profile] DB INIT FAILED", err);
    throw err;
  }
}
export function getProfileDB() {
  return db;
}
