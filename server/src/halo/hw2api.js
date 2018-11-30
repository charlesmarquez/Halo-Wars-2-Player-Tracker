const config = require('../config');
const RateLimiter = require('request-rate-limiter');
const mongo = require('../connection/db');

Array.prototype.hasmin = function (attrib) {
    return this.reduce(function (prev, curr) {
        return prev[attrib] < curr[attrib] ? prev : curr;
    });
}

keydict = initKeys()
// console.log(keydict);

var limiter = new RateLimiter({
    rate: config.keys.length * 10,
    interval: 10,
    backoffTime: 1,
});

const mapArr = [ { 'rostermode\\design\\RM_EvenFlowNight\\RM_EvenFlowNight': 'Infinite Coast Reskin Night' },
{ 'rostermode\\design\\RM_EvenFlow_Desert\\RM_EvenFlow_Desert': 'Infinite Coast Reskin Desert' },
{ 'skirmish\\design\\Ep02_M03\\Ep02_M03': 'FISSURES' },
{ 'skirmish\\design\\MC_EnforcerValley\\MC_EnforcerValley': 'MIRAGE' },
{ 'skirmish\\design\\FF_StopTheSignal\\FF_StopTheSignal': 'HIGH BASTION - HW2 Map' },
{ 'skirmish\\design\\MP_Eagle\\MP_Eagle': 'BADLANDS' },
{ 'skirmish\\design\\MP_Bridges\\MP_Bridges': 'FRONTIER' },
{ 'skirmish\\design\\MP_Razorblade\\MP_Razorblade': 'BEDROCK' },
{ 'skirmish\\design\\MP_Ricochet\\MP_Ricochet': 'SENTRY' },
{ 'skirmish\\design\\MP_Caldera\\MP_Caldera': 'ASHES' },
{ 'skirmish\\design\\MP_Boneyard\\MP_Boneyard': 'HIGHWAY' },
{ 'skirmish\\design\\MP_Veteran\\MP_Veteran': 'VAULT' },
{ 'rostermode\\design\\RM_EvenFlowArt\\RM_EvenFlowArt': 'Infinite Coast' },
{ 'skirmish\\design\\MP_Fracture\\MP_Fracture': 'RIFT' } ]

console.log(`limiter initiated: ${limiter.rate} reqs per ${limiter.interval}s`);

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
            throw "Invalid Response.";
    }
}

async function getJson(response) {
    json = JSON.parse(response.body);
    return json;
}

async function getHistory(count = 50, player = 'aykonz sidekick') {

    var url = `https://www.haloapi.com/stats/hw2/players/${player}/matches?start=1&count=${count}`
    const response = await getRequest(url);
    const json = await getJson(response);

    var matches = [];
    var matchDict = [];
    var events = json['Results'];

    // mapsArr = await parseMaps();
    matchTypeArr = {
        0: `Unknown`,
        1: `Campaign`,
        2: `Custom`,
        3: `Matchmaking`
    };

    // console.log(response)

    events.forEach(element => {

        // matchId = element['MatchId'];
        // map = element['MapId'];
        // matchTypeId = element['MatchType'];
        // matchStartISO = element['MatchStartDate']['ISO8601Date']
        // PlayerMatchDuration = element['PlayerMatchDuration']
        // playlistId = element.PlaylistId
        // mmr = element.UpdatedMmr.Rating
        
        matchStart = matchDate(matchStartISO)
        mapName = null

        // mapsArr.forEach(mapdict => {
            // if (element.MapId in mapdict) {
                // mapName = mapdict[map]
            // }
        // })

        matchTypeId = element.MatchType
        if (matchTypeId in matchTypeArr) {
            matchType = matchTypeArr[matchTypeId]
        }

        element.custom = {
            matchType: matchType,
            matchStart: matchStart,
            mapName: mapName
        }

    }, err => {
        console.error(err)
    })

    return events[0]
    // html.showList(matchDict, 'matchhistory')
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
    count = 10

    req = await getRequest(`https://www.haloapi.com/stats/hw2/player-leaderboards/csr/${seasonId}/${playlistId}?count=${count}`)
    json = await getJson(req)

    results = json.Results

    return results
}
module.exports.getLeaderboard = getLeaderboard

async function parseMaps() {
    req = await getRequest(`https://www.haloapi.com/metadata/hw2/maps`)
    json = await getJson(req)

    results = json['ContentItems']
    maps = []

    results.forEach(x => {
        title = x.View.Title
        mapId = x.View.HW2Map.ID

        maps.push({
            [mapId]: title
        })
    })
    return maps
}

function matchDate(isotime) {
    x = new Date(isotime)
    month = x.getUTCMonth() + 1
    date1 = x.getUTCDate()
    year = x.getUTCFullYear()
    time = x.toLocaleTimeString('en-US', {
        hour12: true
    })

    date = `${month}/${date1}/${year}`
    time = `${time}`

    results = {
        date: date,
        time: time
    }

    return results
}

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
    key = Array.from(keydict).hasmin('called')

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


getMaps()
