const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/abha.sqlite');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const rawDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[ABHA DB ERROR]', err);
  } else {
    console.log('[ABHA DB] Connected to SQLite database at', dbPath);
  }
});

// Configure SQLite for high performance and integrity
rawDb.serialize(() => {
  rawDb.run('PRAGMA foreign_keys = ON;');
  rawDb.run('PRAGMA journal_mode = WAL;');
  rawDb.run('PRAGMA busy_timeout = 5000;');
});

const db = {
  raw: rawDb,

  exec(sql) {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      rawDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  // Synchronous-compatible helper wrapper if needed by prepare
  prepare(sql) {
    return {
      run: (...params) => this.run(sql, params.flat()),
      get: (...params) => this.get(sql, params.flat()),
      all: (...params) => this.all(sql, params.flat())
    };
  }
};

module.exports = {
  getDb: () => db
};
