const mongo = require('mongodb').MongoClient
const assert = require('assert');
const config = require('../config');

const url = config.url
const options = {useNewUrlParser: true}
const dbname = config.dbname
const collection = config.collection

/**
 * @function insertValue
 * 
 * @description 
 * Insert {dict} value into present MongoDB collection off config.js parameters
 * 
 * @param {dict} item | item to be inserted into database 
 * @param {*} collection  | collection within database
 */

async function insertValue(item) {

    conn = await getconn()
    db = conn.db(dbname)

    var coll = db.collection(collection)
    coll.insertOne(item, (err, res) => {
        if (err !== null) {
            console.error(`Already exists in database. _id found. | ${item.gamertag}`);
            return false
        } else {
            console.log(`Inserted: ${item.gamertag}`);
            return true
        }
    })
    conn.close();
}
module.exports.insertValue = insertValue

async function insertValues(item) {

    conn = await getconn()
    db = conn.db(dbname)

    var coll = db.collection(collection)
    coll.insertMany(item,(err, res) => {
        if (err !== null){
            console.error(err)
        }
    })
    conn.close();
}
module.exports.insertValues = insertValues

async function getValues() {
    conn = await getconn()
    db = conn.db(dbname)

    var coll = db.collection(collection)
    var cursor = coll.find();

    x = await cursor.toArray()
    
    conn.close();
    return x
}
module.exports.getValues = getValues

function getconn() {
    var conn = mongo.connect(url, options)
    return conn
}
