const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
// const {canonical} = require('javascript-time-ago/source/gradation');
const halo = require('./hw2api');
const db = require('../connection/db');
const config = require('../config');
var moment = require('moment');
var fs = require('fs');
var path = require('path');

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

    try {
        history.custom.timeAgo = time_ago(history)
        history.custom.matchPlaylist = getPlaylist(history)
        history.custom.mapMetadata = await getMapMeta(history)
    } catch (error) {
        console.log(history);
        console.error(`${playerName}\n`, error);
    }

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
    timeStart = new Date(result.MatchStartDate.ISO8601Date).getTime() //
    timenow = Date.now()
    duration = result.PlayerMatchDuration
    duration = formatDuration(duration)

    TimeAgo.addLocale(en)
    timeAgo = new TimeAgo('en-US')
    diffms = timenow - timeStart - duration
    lastonline = Date.now() - diffms
    diff = moment(lastonline).fromNow()
    // diff = timeAgo.format(Date.now() - diffms, 'canonical')

    // console.log(`timenow: ${timenow}`);
    // console.log(`timestart: ${timeStart}`);
    // console.log(`duration: ${duration}`);
    // console.log(`diffms: ${diffms}`);
    // console.log(`lastonline: ${lastonline}`);
    // console.log(`diff: ${diff}`);

    durMin = Math.floor(duration / 1000 / 60)
    durSec = Math.floor((duration - durMin * 1000 * 60) / 1000)


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

async function dumpLeaderboardAll() {

    console.log(`Dump started (ALL).`);
    const players = JSON.parse(fs.readFileSync(path.join(__dirname, 'players.json')))
    const results = []

        for (const player of players) {
            results.push ({
                player : player,
                history : await getHistoryData(player), // 1 api call: Returns Match History response + custom attrs
                season: await halo.getSeasonStats(player),
                mmr: await halo.getPlaylistStats(player),
                updated : Date.now(),
                _id : player
            })
        }

        db.updateValues({
            item: results,
            dbname: 'halo',
            collection: 'playercsr'
        }, res => {
            console.log(`Data successfully dumped`)
        })
}

module.exports.dumpLeaderboardAll = dumpLeaderboardAll

async function dumpLeaderboardHistory() {
    
    console.log(`Dump started. (HISTORY)`);
    const players = JSON.parse(fs.readFileSync(path.join(__dirname, 'players.json')))
    const results = []

        for (const player of players) {
            results.push ({
                player : player,
                history : await getHistoryData(player), // 1 api call: Returns Match History response + custom attrs
                updated : Date.now(),
                _id : player
            })
        }

        db.updateValues({
            item: results,
            dbname: 'halo',
            collection: 'playercsr'
        }, res => {
            console.log(`Data successfully dumped`)
        })
}
module.exports.dumpLeaderboardHistory = dumpLeaderboardHistory

async function updatePlayers() {
    var arr = []
    set = new Set()

    for (const playlist of config.playlists) {
        var res = await halo.getLeaderboard({
            playlistId: playlist.id
        })
        for (let i = 0; i < res.length; i++) {
            const player = res[i];
            set.add(player.Player.Gamertag)
        }
    }

    arr = Array.from(set)

    var data = fs.readFileSync(path.join(__dirname, 'players.json'));
    var json = JSON.parse(data);
    json.push(...arr);
    fs.writeFileSync(path.join(__dirname, 'players.json'), JSON.stringify(arr))
}
module.exports.updatePlayers = updatePlayers
