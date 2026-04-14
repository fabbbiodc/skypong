import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const statsDataDir =
  process.env.STATS_DATA_DIR?.trim() || path.resolve(process.cwd(), "data");

const statsDbPath =
  process.env.STATS_DB_PATH?.trim() || path.join(statsDataDir, "statistics.db");

fs.mkdirSync(path.dirname(statsDbPath), { recursive: true });

const db = new sqlite3.Database(
  statsDbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Failed to connect to SQLite", err);
    } else {
      console.log("Connected to SQLite", statsDbPath);
    }
  },
);

export function getStatisticsDB() {
  return db;
}

export function closeStatisticsDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
}

export async function initStatisticsDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        await run(`PRAGMA journal_mode = WAL;`);
        await run(`PRAGMA synchronous = NORMAL;`);

        await run(`CREATE TABLE IF NOT EXISTS games_and_results (
			      		game_id TEXT PRIMARY KEY,
			      		user1_id TEXT NOT NULL,
			     		user2_id TEXT NOT NULL,
			      		user1_score INTEGER NOT NULL,
			      		user2_score INTEGER NOT NULL,
			      		user1_result TEXT NOT NULL CHECK(user1_result IN ('win','loss')),
			      		user2_result TEXT NOT NULL CHECK(user2_result IN ('win','loss')),
			      		start_at TEXT NOT NULL,
			      		end_at TEXT NOT NULL,
			      		processed INTEGER DEFAULT 0,
			      		processing INTEGER DEFAULT 0,
			      		processed_at TEXT,
			      		created_at TEXT DEFAULT CURRENT_TIMESTAMP,
						game_mode TEXT,
			      		CHECK (user1_id < user2_id),
			      		CHECK (user1_id != user2_id)
				)`);

        await run(
          `CREATE INDEX IF NOT EXISTS idx_games_processed ON games_and_results(processed)`,
        );
        await run(
          `CREATE INDEX IF NOT EXISTS idx_games_processed_processing ON games_and_results(processed, processing)`,
        );
        await run(
          `CREATE INDEX IF NOT EXISTS idx_games_u1 ON games_and_results(user1_id)`,
        );
        await run(
          `CREATE INDEX IF NOT EXISTS idx_games_u2 ON games_and_results(user2_id)`,
        );

        resolve();
      } catch (err) {
        console.error("DB init error:", err);
        reject(err);
      }
    });
  });
}

function run(sql: string, params: any[] = []) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, (err) => (err ? reject(err) : resolve()));
  });
}
