const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.log("Database error:", err.message);
    } else {
        console.log("Database connected successfully");
    }
});

db.run(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    userId INTEGER NOT NULL
)
`, (err) => {
    if (err) {
        console.log("Tasks table creation error:", err.message);
    } else {
        console.log("Tasks table created successfully");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.log("Users table creation error:", err.message);
    } else {
        console.log("Users table created successfully");
    }
});

module.exports = db;