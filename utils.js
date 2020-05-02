const events = require('events');

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

module.exports.Scheduler = Scheduler;