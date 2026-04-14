import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const dataDir =
  process.env.AUTH_DATA_DIR?.trim() || path.resolve(process.cwd(), "data");
const dbPath =
  process.env.AUTH_DB_PATH?.trim() || path.join(dataDir, "auth.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQlite", err);
  } else {
    console.log("Connected to SQlite:", dbPath);
  }
});

export function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      (async () => {
        try {
          db.run("PRAGMA journal_mode = WAL");

          db.run(`
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password_hashed TEXT NOT NULL,
              password_version INTEGER DEFAULT 1,
              twofa_enabled INTEGER DEFAULT 0,
              token_version INTEGER DEFAULT 0,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP,
              deleted_at TEXT
            )
          `);

          db.run(`
			CREATE TABLE IF NOT EXISTS user_sessions (
				id TEXT PRIMARY KEY,
				user_id TEXT UNIQUE NOT NULL,
			  	issued_at TEXT NOT NULL,
			  	expires_at TEXT NOT NULL,
			  	token_version INTEGER NOT NULL,
			  	created_at TEXT DEFAULT CURRENT_TIMESTAMP
				);
			`);

          db.run(
            `CREATE INDEX IF NOT EXISTS idx_sessions_exp ON user_sessions(expires_at);`,
          );

          resolve();
        } catch (err) {
          reject(err);
        }
      })();
    });
  });
}

export function getDB() {
  return db;
}
