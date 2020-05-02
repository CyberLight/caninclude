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
    }

    get count() {
        return this.totalCount;
    }

    reset() {
        this.data = {};
        this.totalCount = 0;
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
        this.data[key] = (this.data[key] || 0) + 1;
        this.totalCount += 1;
        this.previousCurrentDate = this.currentDate;
    }

    store() {
        return writeFile(this.currentCounterPath, JSON.stringify(this.data));
    }

    load() {
        return readFile(this.currentCounterPath).then(data => {
            this.data = JSON.parse(data);
            this.totalCount = Object.values(this.data).reduce((sum, value) => sum + value, 0);
        });
    }
}

function shortenNumber(n, d) {
    if (n < 1) return "<1";
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