const mongo = require('mongodb').MongoClient
const assert = require('assert');
const config = require('../config');

const url = config.url
const options = {
    useNewUrlParser: true
}

/**
 * @function insertValue
 * 
 * @description 
 * Insert {dict} value into present MongoDB collection off config.js parameters
 * 
 * @param {dict} item | item to be inserted into database 
 * @param {*} collection  | collection within database
 */

async function getValues({
    dbname = config.dbname,
    collection = config.collection
} = {}) {
    conn = await getconn()
    db = conn.db(dbname)

    var coll = await db.collection(collection)
    var cursor = await coll.find();
    // console.time('cursor.toArray')
    var results = await cursor.toArray();
    // console.timeEnd('cursor.toArray')
    conn.close()
    return results
}

module.exports.getValues = getValues

/**
 * @function {updateValues|void}
 * 
 * @param {Array of Dict}
 * 
 * @description
 * Updates halo.playercsr collection in MongoDB Atlas
 */

async function updateValues({
    item,
    dbname = config.dbname,
    collection = config.collection,
} = {}) {

    getconn().then(async (conn) => {
        db = conn.db(dbname)
        var coll = db.collection(collection)

        for (const row of item) {
            uid = row._id
            coll.updateOne({
                _id: uid
            }, {
                $set: row
            }, {
                upsert: true
            })
        }

        console.log(`Database updated for ${item.length} rows.`);
        conn.close()
        return true
    }).catch((err) => {
        console.error(`{updateValues}`, err);
        return false
    });
}
module.exports.updateValues = updateValues

function getconn() {
    var conn = mongo.connect(url, options)
    return conn
}

async function getCollection({
    dbname = config.dbname,
    collection = config.collection,
} = {}) {
    conn = await getconn()
    db = await conn.db(dbname)
    coll = await db.collection(collection)


    setTimeout(() => {
        conn.close()
    }, 60000);
    // Timeout after one minute until better method is found.
    // Unclosed connection

    return {
        conn,
        db,
        coll
    }
}
module.exports.getCollection = getCollection