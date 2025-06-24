import sqlite3 from 'sqlite3'
import fs from 'fs'

const sqliteDB = new sqlite3.Database(process.env.DB_PATH!, (err) => {
    if (err) {
        console.error(err.message);
    }
});

const data = fs.readFileSync(process.env.DB_SCHEMA!, { encoding: 'utf8', flag: 'r' });
sqliteDB.exec(data.toString(), (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1)

    }
})

interface RunResult {
  lastID: number;
  changes: number;
}

const db = {
    serialize: sqliteDB.serialize.bind(sqliteDB),
    prepare: sqliteDB.prepare.bind(sqliteDB),

    all: <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
        return new Promise((resolve, reject) => {
            sqliteDB.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });
    },

    exec: <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
        return new Promise((resolve, reject) => {
            sqliteDB.exec(sql,  (err) => {
                if (err) reject(err);
                else resolve([]);
            });
        });
    },
    run: (sql: string, params: any[] = []): Promise<RunResult> => {
        return new Promise((resolve, reject) => {
            sqliteDB.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    },
    get: <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
        return new Promise((resolve, reject) => {
            sqliteDB.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row as T | undefined);
            });
        });
    }
};
export default db

