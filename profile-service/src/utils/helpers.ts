import sqlite3 from 'sqlite3';

type DbHelpers = {
      	run: (sql: string, params?: any[]) => Promise<{ changes: number }>;
      	get: <T>(sql: string, params?: any[]) => Promise<T | undefined>;
      	all: <T>(sql: string, params?: any[]) => Promise<T[]>;
      	exec: (sql: string) => Promise<void>;
};

const cache = new WeakMap<sqlite3.Database, DbHelpers>();

export function getDbHelpers(db: sqlite3.Database): DbHelpers {
      	if (cache.has(db)) return cache.get(db)!;

	const helpers: DbHelpers = {
		run(sql, params = []) {
			return new Promise((resolve, reject) => {
				db.run(sql, params, function (err) {
					if (err) reject(err);
					else resolve({ changes: this.changes });
				});
			});
		},

		get<T>(sql: string, params: any[] = []) {
			return new Promise<T | undefined>((resolve, reject) => {
				db.get(sql, params, (err, row) => {
					if (err) reject(err);
					else resolve(row as T | undefined);
				});
			});
		},

		all<T>(sql: string, params: any[] = []) {
			return new Promise<T[]>((resolve, reject) => {
				db.all(sql, params, (err, rows) => {
					if (err) reject(err);
					else resolve(rows as T[]);
				});
			});
		},

		exec(sql) {
			return new Promise((resolve, reject) => {
				db.exec(sql, err => {
					if (err) reject(err);
					else resolve();
				});
			});
		},
	};

	cache.set(db, helpers);
	return helpers;
}

export function sleep(ms: number) {
	return new Promise(r => setTimeout(r, ms));
}

export async function hasColumn(
  db: sqlite3.Database,
  table: string,
  column: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows: any[]) => {
      if (err) return reject(err);
      resolve(rows.some(r => r.name === column));
    });
  });
}

export async function addColumnIfMissing(
  db: sqlite3.Database,
  table: string,
  columnDef: string,
  columnName: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const exists = await hasColumn(db, table, columnName);
      if (exists) return resolve();

      db.run(
        `ALTER TABLE ${table} ADD COLUMN ${columnDef}`,
        err => err ? reject(err) : resolve()
      );
    } catch (e) {
      reject(e);
    }
  });
}

