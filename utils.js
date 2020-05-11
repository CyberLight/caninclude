const events = require('events');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const sqlite3 = require("sqlite3").verbose();
const md5 = require('md5');

class Scheduler {
    constructor(trackPeriodInMs = 2 * 1000 * 60) {
        this.trackPeriodInMs = trackPeriodInMs;
        this.emitter = new events.EventEmitter();
        this.emitter.addListener('next', this.next);
    }

    schedule(handler) {
        this.emitter.addListener('perform', handler);
    }

    start() {
        this.next();
    }

    next = () => {
        this.timerId = setTimeout(
            () => this.emitter.emit('perform'),
            this.trackPeriodInMs
        );
    }
}

class Counter {
    constructor() {
        this.data = {};
        this.totalCount = 0;
        this.currentDate = new Date().toJSON().slice(0, 10);
        this.currentCounterPath = `./counters/count${this.currentDate}.json`;
        this.previousCurrentDate = this.currentDate;
        this.uniqTotalCount = 0;
    }

    get count() {
        return this.totalCount;
    }

    get uniqCount() {
        return this.uniqTotalCount;
    }

    reset() {
        this.data = {};
        this.totalCount = 0;
        this.uniqTotalCount = 0;
    }

    async register(ip) {
        const date = new Date().toJSON().slice(0, 10);

        if (this.previousCurrentDate !== date) {
            await this.store();
            this.reset();
        }

        this.currentDate = date;
        this.currentCounterPath = `./counters/count${this.currentDate}.json`;
        const key = `${ip}|${this.currentDate}`;
        const prevCount = this.data[key] || 0;
        if (!prevCount) { this.uniqTotalCount += 1; }
        this.data[key] = prevCount + 1;
        this.totalCount += 1;
        this.previousCurrentDate = this.currentDate;
    }

    store() {
        return writeFile(this.currentCounterPath, JSON.stringify(this.data));
    }

    load() {
        return readFile(this.currentCounterPath).then(data => {
            this.data = JSON.parse(data);
            const values = Object.values(this.data);
            this.totalCount = values.reduce((sum, value) => sum + value, 0);
            this.uniqTotalCount = values.length;
        });
    }
}

function shortenNumber(n, d) {
    if (n < 1) return "0";
    var k = n = Math.floor(n);
    if (n < 1000) return (n.toString().split("."))[0];
    if (d !== 0) d = d || 1;

    function shorten(a, b, c) {
        var d = a.toString().split(".");
        if (!d[1] || b === 0) {
            return d[0] + c
        } else {
            return d[0] + "." + d[1].substring(0, b) + c;
        }
    }

    k = n / 1e15; if (k >= 1) return shorten(k, d, "Q");
    k = n / 1e12; if (k >= 1) return shorten(k, d, "T");
    k = n / 1e9; if (k >= 1) return shorten(k, d, "B");
    k = n / 1e6; if (k >= 1) return shorten(k, d, "M");
    k = n / 1e3; if (k >= 1) return shorten(k, d, "K");
}

class DbConnection {
    constructor(dbFile = "./.data/sqlite.db") {
        this.dbFile = dbFile;
        this.database = new sqlite3.Database(dbFile);
    }

    setup() {
        this.database.serialize(() => {
            this.database.run('PRAGMA journal_mode = WAL;');
            // this.database.run('PRAGMA recursive_triggers=1;');
            this.database.run(`
                CREATE TABLE IF NOT EXISTS feedbacks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL,
                    text TEXT NOT NULL CHECK (length(text) >= 1 AND length(text) <= 280),
                    key TEXT NOT NULL,
                    parent TEXT NOT NULL,
                    child TEXT NOT NULL,
                    resolved INTEGER NO NULL DEFAULT 0 CHECK (resolved = 0 OR resolved = 1),
                    approved INTEGER NO NULL DEFAULT 0 CHECK (resolved = 0 OR resolved = 1),
                    created TEXT NOT NULL DEFAULT(datetime('now')),
                    updatedAt TEXT NOT NULL DEFAULT(datetime('now')),
                    UNIQUE(key)
                );
            `);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_feedbacks_user_parent_child ON feedbacks(user, parent, child);`);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_feedbacks_resolved ON feedbacks(resolved);`);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_feedbacks_approved ON feedbacks(approved);`);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created);`);

            this.database.run(`
                CREATE TRIGGER IF NOT EXISTS [trg_feedbacks_updatedAt]
                    AFTER UPDATE
                    ON feedbacks
                BEGIN
                    UPDATE feedbacks SET updatedAt=datetime('now') WHERE id=OLD.id;
                END;
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS likes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user TEXT NOT NULL,
                    parent TEXT NOT NULL,
                    child TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT('like') CHECK (type = 'like' OR type = 'dislike' OR type = 'unknown'),
                    created TEXT NOT NULL DEFAULT(datetime('now')),
                    updatedAt TEXT NOT NULL DEFAULT(datetime('now')),
                    UNIQUE(user, parent, child)
                );
            `);

            this.database.run(`
                CREATE TRIGGER IF NOT EXISTS [trg_likes_updatedAt]
                    AFTER UPDATE
                    ON likes
                BEGIN
                    UPDATE likes SET updatedAt=datetime('now') WHERE id=OLD.id;
                END;
            `);

            this.database.run(`CREATE INDEX IF NOT EXISTS idx_likes_parent_child ON likes(parent, child);`);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_likes_created ON likes(created);`);
        });
    }
}

class DbManager {
    constructor(conn) {
        this.conn = conn;
    }

    get db() {
        return this.conn.database;
    }

    runOneByOne(cb) {
        this.conn.database.serialize(cb);
    }
}

class DailyFeedbackExceededError extends Error {
    constructor() {
        super('FEEDBACK limit exceeded');
    }
}

class FeedbackManager extends DbManager {
    constructor(dbFile) {
        super(dbFile);
    }

    canAddFeedback(limit=5) {
        return new Promise((resolve, reject) => {
            if (limit === 0) reject(new DailyFeedbackExceededError());
            this.db.get(
                `SELECT COUNT(id) as count FROM feedbacks WHERE date(created)=?`, 
                [new Date().toISOString().substring(0, 10)], 
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    if (row.count < limit) {
                        resolve(true);
                    } else {
                        reject(new DailyFeedbackExceededError());
                    }
                });
        });
    }

    countByTags({ parent, child }) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT COUNT(id) as count 
                FROM feedbacks WHERE 
                parent=? AND 
                child=?;`,
                [parent, child],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(shortenNumber(row.count));
                }
            );
        });
    }

    countAll() {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(id) as count FROM feedbacks;`, [], (err, row) => {
                if (err) {
                    return reject(err);
                }
                return resolve(shortenNumber(row.count));
            });
        });
    }

    add({ user, text, parent, child }) {
        return new Promise((resolve, reject) => {
            const pairKey = `${parent}:${child}`;
            const key = md5(`${user}:${text}:${pairKey}`);

            this.db.run(`INSERT INTO feedbacks (user, key, parent, child, text) VALUES (?,?,?,?,?);`, [user, key, parent, child, text], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    }

    getLastFeedbacks({ user, parent, child }) {
        return new Promise((resolve, reject) => {
            this.db.all(`
            SELECT * FROM feedbacks WHERE 
            user=? AND 
            parent=? AND 
            child=? 
            ORDER BY created DESC
            LIMIT 10`,
                [user, parent, child],
                function (err, rows) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows);
                }
            );
        });
    }
}

class LikesManager extends DbManager {
    getCount(parent, child, type='like') {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(id) as count FROM likes WHERE parent=? AND child=? AND type=?`, [parent, child, type], function (err, row) {
                if (err) {
                    return reject(err);
                }
                resolve(row && row.count || 0);
            });
        });
    }

    getLike(user, parent, child) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT id, type FROM likes WHERE user=? AND parent=? AND child=?`, [user, parent, child], function (err, row) {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    }

    createLike(user, parent, child, type='like') {
        return new Promise((resolve, reject) => {
            this.db.get(`INSERT INTO likes(user, parent, child, type) VALUES(?,?,?,?)`, [user, parent, child, type], function (err, row) {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return reject(new Error('Like not found'));
                }
                resolve(row.id);
            });
        });
    }

    updateLike(id, type = 'like') {
        return new Promise((resolve, reject) => {
            this.db.get(`UPDATE likes SET type=? WHERE id=?`, [type, id], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    }

    async like(user, parent, child, type='like') {
        try {
            const { id } = await this.getLike(user, parent, child);
            await this.updateLike(id, type);
        } catch (e) {
            await this.createLike(user, parent, child, type);
        }
    }

    async unlike(user, parent, child) {
        return this.like(user, parent, child, 'unknown');
    }

    async dislike(user, parent, child) {
        return this.like(user, parent, child, 'dislike');
    }

    async undislike(user, parent, child) {
        return this.like(user, parent, child, 'unknown');
    }

    async votes(user, parent, child) {
        const likes = await this.getCount(parent, child, 'like');
        const dislikes = await this.getCount(parent, child, 'dislike');
        const like = await this.getLike(user, parent, child);
        return {
            likes: shortenNumber(likes),
            dislikes: shortenNumber(dislikes),
            disliked: like && like.type === 'dislike' || false,
            liked: like && like.type === 'like' || false,
            user
        };
    }
}

module.exports.Scheduler = Scheduler;
module.exports.Counter = Counter;
module.exports.shortenNumber = shortenNumber;
module.exports.FeedbackManager = FeedbackManager;
module.exports.LikesManager = LikesManager;
module.exports.DbConnection = DbConnection;