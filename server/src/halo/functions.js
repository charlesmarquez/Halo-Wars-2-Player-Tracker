const moment = require('moment');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
const halo = require('./hw2api');
const db = require('../connection/db');
const config = require('../config');

var mapsPromise = halo.parseMaps()

function formatDuration(duration) {
    patternh = /(\d+)H(\d+)M(\d+)./g;
    patternm = /(\d+)M(\d+)./g;
    patterns = /PT(\d+)./g;

    duration_time = {
        hr: 0,
        min: 0,
        sec: 0,
        total: 0
    }

    if (!!duration.match(patternh)) {
        dur = patternh.exec(duration)
        duration_time.hr = dur[1] * 3600
        duration_time.min = dur[2] * 60
        duration_time.sec = dur[3] * 1
    } else {
        if (!!duration.match(patternm)) {
            dur = patternm.exec(duration)
            duration_time.min = dur[1] * 60
            duration_time.sec = dur[2] * 1
        } else {
            dur = patterns.exec(duration)
            duration_time.sec = dur[1] * 1
        }
    }

    duration_time.total = duration_time.hr + duration_time.min + duration_time.sec
    return duration_time.total * 1000
}

async function getHistoryData(playerName = 'Mike BEASTon') {
    const history = await halo.getHistory(1, playerName)

    history.custom.timeAgo = time_ago(history)
    history.custom.matchPlaylist = getPlaylist(history)
    history.custom.mapMetadata = await getMapMeta(history)

    // console.log(history);

    return history
}

async function getMapMeta(element) {
    mapData = await mapsPromise
    mapMetadata = mapData.ContentItems.find(item => {
        return (item.View.HW2Map.ID == element.MapId)
    })
    return mapMetadata
}

function getPlaylist(result) {
    var id = result.PlaylistId

    if (result.custom.matchType == 'Matchmaking') {
        for (x of config.playlists) {
            if (x.id == id) {
                return x.name
            }
        }
    }

    return "N/A"
}

function time_ago(result) {
    timeStart = new Date(result.MatchStartDate.ISO8601Date) //
    timenow = Date.now()
    duration = result.PlayerMatchDuration
    duration = formatDuration(duration)

    TimeAgo.addLocale(en)
    timeAgo = new TimeAgo('en-US')
    diffms = timenow - timeStart - duration

    durMin = Math.floor(duration / 1000 / 60)
    durSec = Math.floor((duration - durMin * 1000 * 60) / 1000)


    diff = timeAgo.format(Date.now() - diffms)
    return {
        seconds: Math.floor(diffms / 1000),
        ms: diffms,
        timeago: diff,
        duration: `${durMin}:${durSec}`
    }
}

/**
 * @function (lastplayed)
 * 
 * @returns {dict} of results from MongoDB Atlas data binded with HW2 API Results
 */

async function lastplayed() {
    var halodb = await db.getValues()

    for (row of halodb) {
        player = row.Player.Gamertag
        timeAGO = await getTimeDiff(player)
        row.player = player
        row.time = timeAGO

        console.log(row)
    }
    return halodb
}

module.exports.lastplayed = lastplayed

async function getValidName(player) {
    return halo.getPlayer(player)
}
module.exports.getValidName = getValidName

async function matchEvents() {
    return halo.getMatchEvents()
}
module.exports.matchEvents = matchEvents


/**
 * @function {dumpLeaderboardAll}
 * 
 * @description
 * Large database dump.
 * - Update MMR
 * - Update Time Last Played
 * 
 * Heavy Load
 * - 5 API requests per player (approx 500~ Players) | 2500 requests
 * 
 * @returns {void}
 */

async function dumpLeaderboardAll(playlist) {

    halo.getLeaderboard(playlist, 2).then(async (results) => {
        for (const player of results) {
            delete player.Score
            delete player.Rank
            player.history = await getHistoryData(player.Player.Gamertag) // 1 api call: Returns Match History response + custom attrs
            player.season = await halo.getSeasonStats(player.Player.Gamertag) // 1 api call: returns Season stats endpoint
            player.mmr = await halo.getPlaylistStats(player.Player.Gamertag) // 3 api calls: returns MMR for 1,2,3 ranked playlists
            player.updated = Date.now()
            player._id = player.Player.Gamertag
            console.log(player._id)
        }
        db.updateValues({
            item: results,
            dbname: 'test',
            collection: 'playercsr'
        }, res => {
            console.log(`Data successfully dumped`)
        })
    }).catch(err => {
        console.error(err)
    })
}

module.exports.dumpLeaderboardAll = dumpLeaderboardAll


async function dumpLeaderboardHistory(playlist) {

    console.log(`Starting Leaderboard dump for playlist ${playlist}`)

    halo.getLeaderboard(playlist, 250).then(async (results) => {
        for (const player of results) {
            delete player.Score
            delete player.Rank
            player.history = await getHistoryData(player.Player.Gamertag) // (1 API calls) Returns Match History response + custom attrs
            player.updated = Date.now()
            player._id = player.Player.Gamertag
        }
        db.updateValues({
            item: results,
            dbname: 'test',
            collection: 'playercsr'
        }, res => {
            console.log(`Data successfully dumped`)
        })
    }).catch(err => {
        console.error(err)
    })
}
module.exports.dumpLeaderboardHistory = dumpLeaderboardHistory

dumpLeaderboardAll('548d864e-8666-430e-9140-8dd2ad8fbfcd')
dumpLeaderboardAll('379f9ee5-92ec-45d9-b5e5-9f30236cab00')
dumpLeaderboardAll('4a2cedcc-9098-4728-886f-60649896278d')