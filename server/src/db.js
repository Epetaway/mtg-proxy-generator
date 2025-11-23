const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { DB_FILE } = require('./config');

const dbPath = path.join(__dirname, '..', DB_FILE);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sets (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    released_at TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    name TEXT,
    set_id TEXT,
    set_code TEXT,
    collector_number TEXT,
    rarity TEXT,
    lang TEXT,
    image_uri TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);
});

module.exports = db;
