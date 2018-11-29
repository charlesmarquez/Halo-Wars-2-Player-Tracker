const db = require('../connection/db');

x = async () => {
    res = await db.getValues()
    res.sort(function (a, b) {
        return a.history.custom.timeAgo.seconds - b.history.custom.timeAgo.seconds
    })

    return res
}

x()