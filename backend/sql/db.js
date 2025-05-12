import sqlite3 from 'sqlite3'
import fs from 'fs'

const db = new sqlite3.Database(process.env.DB_PATH ,(err) => {
    if (err) {
        console.error(err.message);
    }
});

const data = fs.readFileSync(process.env.DB_SCHEMA, { encoding: 'utf8', flag: 'r' });
db.exec(data.toString(), (err) => {
    if (err) 
        console.error(err.message);
})

export default db
