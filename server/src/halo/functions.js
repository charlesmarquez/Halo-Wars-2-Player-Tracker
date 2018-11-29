const moment = require('moment');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
const halo = require('./hw2api');
const db = require('../connection/db');

const playlistMap = [{
        name: '3v3',
        id: `4a2cedcc-9098-4728-886f-60649896278d`
    },
    {
        name: '2v2',
        id: `379f9ee5-92ec-45d9-b5e5-9f30236cab00`
    },
    {
        name: '1v1',
        id: `548d864e-8666-430e-9140-8dd2ad8fbfcd`
    },
]


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


/**
 * @function (getTimeDiff|String)
 * 
 * @param playerName
 * Gamertag to be tracked.
 * 
 * @description (1 API Request) 
 * Provides time since last game completed on match history.
 * 
 * @returns (String) Time-ago of last game.
 */

async function getHistoryData(playerName = 'Mike BEASTon') {
    const history = await halo.getHistory(1, playerName)

    history.custom.timeAgo = time_ago(history)
    history.custom.matchPlaylist = getPlaylist(history)

    return history
}

function getPlaylist(result) {
    var id = result.PlaylistId

    if (result.custom.matchType == 'Matchmaking') {
        for (x of playlistMap) {
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

    diff = timeAgo.format(Date.now() - diffms)
    return {
        seconds: Math.floor(diffms / 1000),
        timeago: diff
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

async function dumpLeaderboard() {

    for (const playlist of playlistMap) {

        halo.getLeaderboard(playlist.id).then(async (results) => {

            for (const player of results) {
                player.history = await getHistoryData(player.Player.Gamertag) // Returns Match History response + custom attrs
                player.updated = Date.now()
                player._id = player.Player.Gamertag

            }

            db.updateValues(results, res => {
                console.log(`Data successfully dumped`)
            })

        }).catch(err => {
            console.error(err)
        })
    }
}
module.exports.dumpLeaderboard = dumpLeaderboard