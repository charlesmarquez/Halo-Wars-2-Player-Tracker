const config = require('../config');
const RateLimiter = require('request-rate-limiter');
const mongo = require('../connection/db');

Array.prototype.hasmin = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
}

keydict = initKeys()

var limiter = new RateLimiter({
    rate: config.keys.length * 10,
    interval: 10,
    backoffTime: 3,
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
            'Ocp-Apim-Subscription-Key': await getKey(keydict)
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

async function getHistory(count = 1, player = 'aykonz sidekick') {

    var url = `https://www.haloapi.com/stats/hw2/players/${player}/matches?start=1&count=${count}`
    const response = await getRequest(url);
    const json = await getJson(response);

    var events = json.Results;

    matchTypeArr = {
        0: `Unknown`,
        1: `Campaign`,
        2: `Custom`,
        3: `Matchmaking`
    };

    events.forEach(async (element) => {

        matchTypeId = element.MatchType
        if (matchTypeId in matchTypeArr) {
            matchType = matchTypeArr[matchTypeId]
        }

        element.custom = {
            matchType: matchType
        }

    }, err => {
        console.error(err)
    })

    return events[0]
}
module.exports.getHistory = getHistory

async function getPlayerSummary(player = 'mike beaston', id = 'right-content') {
    var url = `https://www.haloapi.com/stats/hw2/players/${player}/stats`

    const response = await getRequest(url);
    const json = await getJson(response);
    var events = json['MatchmakingSummary']['RankedPlaylistStats'];

    leaderSort = []

    events.forEach(event => {
        playlistsummary = event['PlaylistId']
        switch (playlistsummary) {
            case '548d864e-8666-430e-9140-8dd2ad8fbfcd': // 1v1 Leader Stats
                leaderstats = event['LeaderStats']
                for (leader in leaderstats) {
                    x = leaderstats[leader]
                    won = x['TotalMatchesWon']
                    started = x['TotalMatchesStarted']
                    rate = won / started

                    leaderDict = {
                        leader: {
                            leader: leader,
                            won: won,
                            started: started,
                        }
                    }
                    leaderSort.push(leaderDict);
                    // appendKnob(won, started, leader, 'leaderknob')
                }
                break;
        }
    })
}
module.exports.getPlayerSummary = getPlayerSummary

async function getSeasonStats(player = 'mike beaston', seasonId = '3527a6d6-29d6-485f-9be6-83a5881ce42c') {

    const url = `https://www.haloapi.com/stats/hw2/players/${player}/stats/seasons/${seasonId}`

    const response = await getRequest(url);
    const json = await getJson(response);
    seasonRanked = {}

    const playlistMap = config.playlists

    for (x of playlistMap) {
        results = json.RankedPlaylistStats.find(res => {
            return res.PlaylistId == x.id
        })

        if (typeof results !== 'undefined') {
            results.PlaylistName = x.name
            seasonRanked[results.PlaylistName] = (results)
        }
    }

    // console.log(seasonRanked)
    return seasonRanked
}
module.exports.getSeasonStats = getSeasonStats

// getSeasonStats()

/**
 * @function {getPlaylistStats}
 * 
 * @param {player | String}
 * 
 * @description
 * Contains MMR and RAW CSR values. Looks at 1v1, 2v2, 3v3
 * 
 * @todo
 * Uses 3 requests per player. Has potential to query 6 players per request. OPTIMIZE.
 */

async function getPlaylistStats(player = 'admiration') {

    const playlistMap = config.playlists

    stats = {}

    for (x of playlistMap) {
        const url = `https://www.haloapi.com/stats/hw2/playlist/${x.id}/rating?players=${player}`
        const response = await getRequest(url);
        const json = await getJson(response);

        res = json.Results[0].Result
        stats[x.name] = res
    }
    return stats
}
module.exports.getPlaylistStats = getPlaylistStats

test = async () => {
    x = await getPlaylistStats()
    console.log(x)
}

test()

async function getLastGameID(player) {
    var url = `https://www.haloapi.com/stats/hw2/players/${player}/matches?start=1&count=1`

    const response = await getRequest(url);
    const json = await getJson(response);
    return (json.Results[0].MatchId);
}

async function getPlayer(player = 'Mike BEASTon') {

    var player = player
    var playerName = player

    var matchId = await getLastGameID(player);

    var url = `https://www.haloapi.com/stats/hw2/matches/${matchId}/events`
    const response = await getRequest(url);
    const json = await getJson(response);

    events = json.GameEvents

    for (const event of events) {
        if (event.EventName == 'PlayerJoinedMatch') {
            if (event.HumanPlayerId !== null) {
                playerName = event.HumanPlayerId.Gamertag;
                if (player.toUpperCase() === playerName.toUpperCase()) {
                    return playerName
                }
            }
        }
    }
}
module.exports.getPlayer = getPlayer

async function getLeaderboard(playlistId = '548d864e-8666-430e-9140-8dd2ad8fbfcd') {
    seasonId = '3527a6d6-29d6-485f-9be6-83a5881ce42c'
    count = 3

    req = await getRequest(`https://www.haloapi.com/stats/hw2/player-leaderboards/csr/${seasonId}/${playlistId}?count=${count}`)
    json = await getJson(req)

    results = json.Results

    return results
}
module.exports.getLeaderboard = getLeaderboard

async function parseMaps() {
    req = await getRequest(`https://www.haloapi.com/metadata/hw2/maps`)
    json = await getJson(req)

    return json
}
module.exports.parseMaps = parseMaps

function initKeys() {
    apikeys = config.keys
    keydict = []

    apikeys.forEach(key => {
        x = {
            key: key,
            called: 0,
            status: true
        }
        keydict.push(x)
    });

    console.log(`KEYS INITIATED`);

    return keydict
}

async function getKey(keydict) {
    var key = Array.from(keydict).hasmin('called')

    if (key.status) {
        if (key.called < 10) {
            key.called++
            result = String(key.key)
            // console.log(`key: ${key.key} | called: ${key.called} | status: ${key.status}`);
        } else {
            key.status = false
            // console.log(`${key.key} switched to ${key.status}`);
            resetKeys(keydict)
        }
    }
    return result
}

function checkKeys(keydict) {
    states = []
    for (const key of keydict) {
        states.push(key.status)
    }

    x = false
    for (const state of states) {
        x = x || state
    }

    if (!x) {
        resetKeys(keydict)
    }
}

function resetKeys(keydict) {
    for (const key of keydict) {
        key.called = 0
        key.status = true
    }

    console.log(`Rate Reset`);
    return keydict
}

function testkeys() {
    keydict = initKeys()

    for (let i = 0; i < 70; i++) {
        apikey = getKey(keydict)
        // console.log(`using: ${apikey}`);
    }
}