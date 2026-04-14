import fs from "fs";
import sqlite3 from "sqlite3";
import path from "path";

const dataDir =
  process.env.AUTH_DATA_DIR?.trim() || path.resolve(process.cwd(), "data");
const tokenDbPath =
  process.env.AUTH_TOKENS_DB_PATH?.trim() || path.join(dataDir, "tokens.db");

fs.mkdirSync(path.dirname(tokenDbPath), { recursive: true });

const tokenDb = new sqlite3.Database(tokenDbPath, (err) => {
  if (err) {
    console.error("Failed to connect to tokens DB", err);
  } else {
    console.log("Connected to tokens DB:", tokenDbPath);
  }
});

export function initTokenDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    tokenDb.run(
      `CREATE TABLE IF NOT EXISTS refresh_tokens (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL,
				expires_at TEXT NOT NULL,
				revoked INTEGER DEFAULT 0
		  	)`,
      (err) => (err ? reject(err) : resolve()),
    );
  });
}

export function getTokenDB() {
  return tokenDb;
}
