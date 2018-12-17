const config = require('../config');
const RateLimiter = require('request-rate-limiter');
const mongo = require('../connection/db');
const {KeyQueue} = require('./KeyQueue');

Array.prototype.hasmin = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
}

keydict = initKeys()

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

async function getHistory(count = 1, player = 'aykonz sidekick') {

    var url = `https://www.haloapi.com/stats/hw2/players/${player}/matches?start=0&count=${count}`
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

async function getPlaylistStats(player = 'mike beaston') {
    const playerName = player
    var stats = {}

    for (const playlist of config.playlists) {
        const url = `https://www.haloapi.com/stats/hw2/playlist/${playlist.id}/rating?players=${playerName}`
        const response = await getRequest(url)
        const json = await getJson(response)
        MMR = json.Results[0].Result
        stats[playlist.name] = MMR
    }
    return stats
}
module.exports.getPlaylistStats = getPlaylistStats

async function getLastGameID(player) {
    var url = `https://www.haloapi.com/stats/hw2/players/${player}/matches?start=1&count=1`

    const response = await getRequest(url);
    const json = await getJson(response);
    return (json.Results[0].MatchId);
}

async function getMatchEvents(matchId = 'a9e73a2a-7a61-4732-b637-1c4352ab7d3f') {
    var url = `https://www.haloapi.com/stats/hw2/matches/${matchId}/events`
    const response = await getRequest(url);
    const json = await getJson(response);

    return json.GameEvents
}
module.exports.getMatchEvents = getMatchEvents

async function getPlayer(player = 'Mike BEASTon') {

    var player = player
    var playerName = player

    var matchId = await getLastGameID(player);
    var events = await getMatchEvents(matchId)

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