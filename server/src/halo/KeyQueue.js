config = require('../config');

class APIKey {
    constructor(key) {
        this.key = key
        this.ratelimit = 10
        this.atLimit = false
        this.counter = 0
        this.priority = 1
        this.isProduction = false

        this.checkProduction(key)
    }

    getKey() {
        this.counter++
        this.checkLimit()
        return this.key
    }

    checkLimit() {
        this.atLimit = this.counter == this.ratelimit - 1
    }

    checkProduction(key) {
        var x = config.production.some((elem) => {
            return elem == key
        })

        if (x) {
            this.isProduction = true
            this.priority = 10
            this.ratelimit = 200
        }
    }
}

class KeyQueue {
    constructor() {
        this.keys = []
    }
 
    addKeys(arr) {
        this.origState = arr
        for (let key of arr) {
            this.enqueue(key)
        }
    }

    enqueue(key) {
        var apiKey = new APIKey(key)

        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i].priority > apiKey.priority) {
                this.keys.splice(i, 0, apiKey)
                var contain = true;
                break;
            }
        }

        if (!contain) {
            this.keys.push(apiKey);
        }
    }

    dequeue() {
        // Uses highest priority
        if (this.isEmpty())
            return 'underflow'
        return this.keys.pop()
    }

    isEmpty() {
        return this.keys.length == 0;
    }

    front() {
        if (this.isEmpty())
            return "Nothing in queue."
        return this.keys[0]
    }

    rear() {
        if (this.isEmpty())
            return "Nothing in queue."
        return this.keys[this.keys.length - 1]
    }

    getKey() {
        if (this.isEmpty())
            this.addKeys(this.origState)

        if (this.rear().atLimit) {
            return this.dequeue().key
        } else {
            return this.rear().getKey()
        }
    }
}
module.exports.KeyQueue = KeyQueue