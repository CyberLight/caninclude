const events = require('events');
const sqlite3 = require("sqlite3").verbose();
const md5 = require('md5');
const util = require('util');

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

            this.database.run(`
                CREATE TABLE IF NOT EXISTS counters (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT NOT NULL,
                    count INTEGER NOT NULL DEFAULT(0),
                    created TEXT NOT NULL DEFAULT(date('now')),
                    updatedAt TEXT NOT NULL DEFAULT(datetime('now')),
                    UNIQUE(key, created)
                );
            `);

            this.database.run(`
                CREATE TRIGGER IF NOT EXISTS [trg_counters_updatedAt]
                    AFTER UPDATE
                    ON counters
                BEGIN
                    UPDATE counters SET updatedAt=datetime('now') WHERE id=OLD.id;
                END;
            `);

            this.database.run(`
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    child TEXT NOT NULL,
                    parent TEXT NOT NULL,
                    canInclude INTEGER NOT NULL DEFAULT('no') CHECK (canInclude = 'yes' OR canInclude = 'no' OR canInclude = 'doubt'),
                    count INTEGER NOT NULL DEFAULT(0),
                    created TEXT NOT NULL DEFAULT(date('now')),
                    updatedAt TEXT NOT NULL DEFAULT(datetime('now')),
                    UNIQUE(child, parent, canInclude, created)
                );
            `);

            this.database.run(`
                CREATE TRIGGER IF NOT EXISTS [trg_history_updatedAt]
                    AFTER UPDATE
                    ON history
                BEGIN
                    UPDATE history SET updatedAt=datetime('now') WHERE id=OLD.id;
                END;
            `);

            this.database.run(`CREATE INDEX IF NOT EXISTS idx_history_created ON history(created);`);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_history_count ON history(count);`);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_history_child_parent_created ON history(child, parent, created);`);
            this.database.run(`CREATE INDEX IF NOT EXISTS idx_history_updatedAt ON history(updatedAt);`);
        });
    }
}

class DbManager {
    constructor(conn) {
        this.conn = conn;
        this.getAsync = util.promisify(this.db.get).bind(this.db);
        this.allAsync = util.promisify(this.db.all).bind(this.db);
        this.runAsync = util.promisify(this.db.run).bind(this.db);
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

    approve({ id }) {
        return this.runAsync(`UPDATE feedbacks SET approved=1 WHERE id=?`, [id]);
    }

    unapprove({ id }) {
        return this.runAsync(`UPDATE feedbacks SET approved=0 WHERE id=?`, [id]);
    }

    resolve({ id }) {
        return this.runAsync(`UPDATE feedbacks SET resolved=1 WHERE id=?`, [id]);
    }

    unresolve({ id }) {
        return this.runAsync(`UPDATE feedbacks SET resolved=0 WHERE id=?`, [id]);
    }

    remove({ id }) {
        return this.runAsync(`DELETE FROM feedbacks WHERE id=?`, [id]);
    }

    async getAllByPage({ page }) {
        const row = await this.getAsync('SELECT COUNT(id) as count FROM feedbacks;', []);
        const count = row.count;
        const MaxPages = Math.floor(count / 10) + (count % 10 !== 0 ? 1 : 0);
        const offset = ((page - 1) * 10) % count;
        const rows = await this.allAsync(`SELECT * FROM feedbacks ORDER BY created DESC LIMIT 10 OFFSET ${offset};`, []);
        return { currentPage: page, feedbacks: rows, totalPages: MaxPages };
    }
}

class RecordNotFoundError extends Error {
    constructor(message) {
        super(message || 'Record not found');
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
                if (!row) {
                    return reject(new RecordNotFoundError());
                }
                resolve(row);
            });
        });
    }

    async getLikeSafe(user, parent, child, defaultValue = {}) { 
        try {
            return await this.getLike(user, parent, child);
        } catch(e) {
            if (typeof e === RecordNotFoundError) {
                return defaultValue;
            }
        }
    }

    createLike(user, parent, child, type='like') {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO likes(user, parent, child, type) VALUES(?,?,?,?)`, [user, parent, child, type], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
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
        const like = await this.getLikeSafe(user, parent, child, { type: 'unknown' });
        return {
            likes: shortenNumber(likes),
            dislikes: shortenNumber(dislikes),
            disliked: like && like.type === 'dislike' || false,
            liked: like && like.type === 'like' || false,
            user
        };
    }
}

class Counter extends DbManager {
    constructor(dbConn) {
        super(dbConn);
        this.totalCount = 0;
        this.uniqTotalCount = 0;
    }

    get count() {
        return this.totalCount;
    }

    get uniqCount() {
        return this.uniqTotalCount;
    }

    async getBy({ key, date }) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT key, count FROM counters WHERE key=? AND created=?', 
                [key, date.toISOString().slice(0,10)], 
                function (err, row) {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        return reject(new RecordNotFoundError());
                    }
                    resolve(row);
                });
        });
    }

    async create({ key }) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO counters(key, count) VALUES(?,?)', [key, 1], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });
        });
    }

    async update({ key }) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE counters SET count=count+1 WHERE key=? AND created=?', 
                [
                    key, 
                    new Date().toISOString().slice(0, 10)
                ], 
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.lastID);
                });
        });
    }

    async getTotals() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT COUNT(id) as uniqCount, SUM(count) as totalCount FROM counters WHERE created=? GROUP BY date(created)',
                [new Date().toISOString().slice(0, 10)],
                function (err, row) {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        resolve({ uniqCount: 0, totalCount: 0 });
                    }
                    resolve(row);
                });
        });
    }

    async register(ip) {
        const key = md5(ip);
        try {
            const record = await this.getBy({ key, date: new Date() });
            await this.update({ key: record.key });
        } catch (e) {
            if (e instanceof RecordNotFoundError) {
                await this.create({ key });
            }
        }
    }

    async load() {
        const result = await this.getTotals();
        this.totalCount = result && result.totalCount || 0;
        this.uniqTotalCount = result && result.uniqCount || 0;
    }
}

class HistoryManager extends DbManager {
    async getBy({ parent, child, date }) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, parent, child, canInclude FROM history WHERE parent=? AND child=? AND created=?',
                [parent, child, date.toISOString().slice(0, 10)],
                function (err, row) {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        return reject(new RecordNotFoundError());
                    }
                    resolve(row);
                });
        });
    }

    async getLastBy() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT id, parent, child, canInclude, count FROM history ORDER BY updatedAt DESC LIMIT 10`,
                [],
                function (err, rows) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows);
                });
        });
    }

    async create({ parent, child, canInclude}) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO history(parent, child, canInclude, count) VALUES(?,?,?,1)', 
                [parent, child, canInclude.toLowerCase()], 
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.lastID);
                });
        });
    }

    async updateCountBy({ parent, child, date }) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE history SET count=count+1 WHERE parent=? AND child=? AND created=?',
                [
                    parent,
                    child,
                    date.toISOString().slice(0, 10)
                ],
                function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(this.lastID);
                });
        });
    }

    async register({ parent, child, canInclude }) {
        try {
            const date = new Date();
            const record = await this.getBy({ parent, child, date });
            await this.updateCountBy({ parent: record.parent, child: record.child, date });
        } catch (e) {
            if (e instanceof RecordNotFoundError) {
                await this.create({ parent, child, canInclude });
            }
        }
    }
}

module.exports.Scheduler = Scheduler;
module.exports.Counter = Counter;
module.exports.shortenNumber = shortenNumber;
module.exports.DbConnection = DbConnection;
module.exports.FeedbackManager = FeedbackManager;
module.exports.LikesManager = LikesManager;
module.exports.HistoryManager = HistoryManager;