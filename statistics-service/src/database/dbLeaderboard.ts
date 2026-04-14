import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const leaderboardDataDir =  process.env.STATS_DATA_DIR?.trim() || path.resolve(process.cwd(), 'data');

const leaderboardDbPath = process.env.STATS_DB_PATH?.trim() || path.join(leaderboardDataDir, 'leaderboard.db');

fs.mkdirSync(path.dirname(leaderboardDbPath), { recursive: true });

const db = new sqlite3.Database(leaderboardDbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, err => {
								if (err) console.error('Leaderboard DB error', err);
								else console.log('Connected leaderboard DB');
});

export function initLeaderboardDB() {

      	return new Promise<void>((resolve, reject) => {

	    	db.serialize(() => {

			let failed = false;

			const onError = (err: Error | null) => {
				if (err && !failed) {
					failed = true;
					db.run('ROLLBACK');
					reject(err);
				}
			}

			db.run('PRAGMA journal_mode = WAL');
			db.run('BEGIN');

			db.run(`CREATE TABLE IF NOT EXISTS leaderboard_cache (

				user_id TEXT PRIMARY KEY,

		      		played INTEGER,
		      		wins INTEGER,
		      		losses INTEGER,

		      		winrate REAL,
		      		rate INTEGER,

		      		updated_at TEXT
			)`, onError);

			db.run(`CREATE INDEX IF NOT EXISTS idx_lb_rate
		       	       ON leaderboard_cache(rate DESC)`, onError);

			db.run(`CREATE INDEX IF NOT EXISTS idx_lb_winrate
		      	      ON leaderboard_cache(winrate DESC)`, onError);

			db.run(`CREATE INDEX IF NOT EXISTS idx_lb_played 
			       ON leaderboard_cache(played DESC)`, onError);

			db.run(`CREATE INDEX IF NOT EXISTS idx_lb_wins 
			       ON leaderboard_cache(wins DESC)`, onError);
			
			db.run('COMMIT', err => {
				if (err) {
					db.run('ROLLBACK');
					return reject(err);
				}

				resolve();
			});
	    	});
      	});
}

export function getLeaderboardDB() {
	return db;
}

export function closeLeaderboardDB(): Promise<void> {
  	return new Promise((resolve, reject) => {
				   	   db.close(err => (err ? reject(err) : resolve()));
					   });
}
