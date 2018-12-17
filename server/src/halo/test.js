const config = require('../config');
const RateLimiter = require('request-rate-limiter');
const mongo = require('../connection/db');
const {
    KeyQueue
} = require('./KeyQueue');
var fs = require('fs');

keys = new KeyQueue()
keys.addKeys(config.keys)

var limiter = new RateLimiter({
    rate: (config.keys.length * 10) + (config.production.length * 190),
    interval: 10,
    backoffTime: 3,
    maxWaitingTime: 300
});

console.log(`limiter initiated: ${limiter.rate} reqs per ${limiter.interval}s`);

/**
 * @function getRequest
 * 
 * @param {url | string}
 * 
 * @description
 * Processes requests, utilizes getKey to allow usage of multiple API keys 
 * 
 * @returns {response | HTTP Response}
 */
async function getRequest(url) {
    const options = {
        url: url,
        method: 'GET',
        dataType: 'json',
        headers: {
            'Accept-Language': 'en',
            'Ocp-Apim-Subscription-Key': keys.getKey()
        }
    }

    response = await limiter.request(options)

    switch (response.statusCode) {
        case 200:
            return response
        default:
            console.error(options.headers);
            throw `Invalid Response. ${response.statusCode}`;
    }
}

/**
 * @function getJson 
 * 
 * @param {response | HTTP Response}
 * 
 * @description
 * Provides JSON object for provide response
 * 
 * @returns {json | JSON object}
 */
async function getJson(response) {
    json = JSON.parse(response.body);
    return json;
}

async function getLeaderboard({
    playlistId = `548d864e-8666-430e-9140-8dd2ad8fbfcd`,
    count = 250,
} = {}) {
    // seasonId = '3527a6d6-29d6-485f-9be6-83a5881ce42c'
    // seasonId = '3cda4240-6d72-4b09-99cd-f1f2c89eb0ee'
    seasonId = '768ff143-675d-49e2-9955-72dd189f7481'


    req = await getRequest(`https://www.haloapi.com/stats/hw2/player-leaderboards/csr/${seasonId}/${playlistId}?count=${count}`)
    json = await getJson(req)

    results = json.Results
    return results
}

async function updateFromLeaderboard() {
    set = new Set()

    for (const playlist of config.playlists) {
        const leaderboard = await getLeaderboard({
            playlistId: playlist.id
        })

        for (let i = 0; i < leaderboard.length; i++) {
            const board = leaderboard[i];
            set.add(board.Player.Gamertag)
        }
    }

    console.log(set.size);
    iter = set.values();
    arr = []

    for (var i = 0; i < set.size; i++) {
        player = iter.next().value
        arr.push({
            _id: player,
            name: player
        })
    }

    mongo.updateValues({
        item: arr,
        dbname: 'test',
        collection: 'players'
    })
}

async function getPlayerList() {
    console.time('toArray')
    x = await mongo.getValues({
        dbname: 'test',
        collection: 'players'
    })
    console.timeEnd('toArray')
}

async function addToPlayerList(player) {
    console.time('toArray')

    mongo.updateValues({
        item: {
            _id: player,
            name: player,
        },
        dbname: 'test',
        collection: 'players'
    })

    console.timeEnd('toArray')
}

async function updatePlayers() {
    var arr = []
    set = new Set()

    for (const playlist of config.playlists) {
        var res = await getLeaderboard({
            playlistId: playlist.id
        })
        console.log(res.len);
    }
    for (let i = 0; i < res.length; i++) {
        const player = res[i];
        set.add(player.Player.Gamertag)
    }
    arr = Array.from(set)

    console.log(arr.len);

    // var data = fs.readFileSync('testOutput.json');
    // var json = JSON.parse(data);
    // json.push(...arr);
    // fs.writeFileSync("players.json", JSON.stringify(arr))
}

updatePlayers()