const moment = require('moment');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');
const halo = require('./hw2api');
const db = require('../connection/db');


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

function time_ago(result) {
    timeStart = new Date(result.matchStartISO) //
    timenow = Date.now()
    duration = result.PlayerMatchDuration
    duration = formatDuration(duration)

    TimeAgo.addLocale(en)
    timeAgo = new TimeAgo('en-US')
    diffms = timenow - timeStart - duration

    diff = timeAgo.format(Date.now() - diffms)
    return {
        seconds: Math.floor(diffms/1000),
        timeago: diff,
        matchType: matchType
    }
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

async function getTimeDiff(playerName = 'Mike BEASTon') {
    history = await halo.getHistory(1, playerName)
    for (res of history) {
        timeDiff = time_ago(res)
        return timeDiff
    }
}

async function lastplayed() {
    halodb = await db.getValues()

    var results = []

    for (res of halodb) {
        player = res.gamertag
        timeAGO = await getTimeDiff(player)
        dict = {
            player: player,
            time: timeAGO
        }
        results.push(dict)
    }

    return results

}
module.exports.lastplayed = lastplayed
