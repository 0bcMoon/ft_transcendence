import sqlite3 from 'sqlite3'
import fs from 'fs'

const sqliteDB = new sqlite3.Database(process.env.DB_PATH, (err) => {
    if (err) {
        console.error(err.message);
    }
});

const data = fs.readFileSync(process.env.DB_SCHEMA, { encoding: 'utf8', flag: 'r' });
sqliteDB.exec(data.toString(), (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1)

    }
})

const db = {
    serialize: sqliteDB.serialize.bind(sqliteDB),
    prepare: sqliteDB.prepare.bind(sqliteDB),
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            sqliteDB.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            sqliteDB.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    },

    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            sqliteDB.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};


export default db
