const events = require('events');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

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

class LikeManager {
    constructor() {
        this.likesStore = {};
        this.dislikesStore = {};
    }

    votes(user, parent, child) {
        const key = `${parent}:${child}`;
        this.likesStore[key] = this.likesStore[key] || {};
        this.dislikesStore[key] = this.dislikesStore[key] || {};
        const liked = this.likesStore[key][user];
        const disliked = this.dislikesStore[key][user];
        return {
            likes: shortenNumber(this.likes(parent, child) || 0),
            dislikes: shortenNumber(this.dislikes(parent, child) || 0),
            disliked,
            liked
        };
    }

    likes(parent, child) {
        const key = `${parent}:${child}`;
        return this.likesStore[key].counter;
    }

    dislikes(parent, child) {
        const key = `${parent}:${child}`;
        return this.dislikesStore[key].counter;
    }

    like(user, parent, child) {
        const key = `${parent}:${child}`;
        this.likesStore[key] = this.likesStore[key] || {};
        if (!this.likesStore[key][user]) {
            this.likesStore[key][user] = 1;
            this.likesStore[key].counter = (this.likesStore[key].counter || 0)  + 1;
            this.delDislike(user, parent, child);
        }
    }

    dislike(user, parent, child) {
        const key = `${parent}:${child}`;
        this.dislikesStore[key] = this.dislikesStore[key] || {};
        if (!this.dislikesStore[key][user]) {
            this.dislikesStore[key][user] = 1;
            this.dislikesStore[key].counter = (this.dislikesStore[key].counter || 0) + 1;
            this.delLike(user, parent, child);
        }
    }

    delDislike(user, parent, child) {
        const key = `${parent}:${child}`;
        this.dislikesStore[key] = this.dislikesStore[key] || {};
        if (this.dislikesStore[key][user]) {
            this.dislikesStore[key].counter = (this.dislikesStore[key].counter || 0) - 1;
            delete this.dislikesStore[key][user];
        }
    }

    delLike(user, parent, child) {
        const key = `${parent}:${child}`;
        this.likesStore[key] = this.likesStore[key] || {};
        if (this.likesStore[key][user]) {
            this.likesStore[key].counter = (this.likesStore[key].counter || 0) - 1;
            delete this.likesStore[key][user];
        }
    }

    store() {
        return Promise.all([
            writeFile('./votes/likes.json', JSON.stringify(this.likesStore)),
            writeFile('./votes/dislikes.json', JSON.stringify(this.dislikesStore))
        ]);
    }

    load() {
        return Promise.all([
            readFile('./votes/likes.json'),
            readFile('./votes/dislikes.json')
        ]).then(([likes, dislikes]) => {
            this.likesStore = JSON.parse(likes);
            this.dislikesStore = JSON.parse(dislikes);
        }).catch(() => {
            this.likesStore = {};
            this.dislikesStore = {};
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

module.exports.Scheduler = Scheduler;
module.exports.Counter = Counter;
module.exports.shortenNumber = shortenNumber;
module.exports.LikeManager = LikeManager;