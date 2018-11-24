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

    console.log(`${dbname}: ${collection}`);

    var coll = db.collection(collection)
    coll.insertOne(item, (err, res) => {
        assert.equal(null, err)
        console.log(`Inserted: ${item.gamertag}`);
    })

    conn.close();
}
module.exports.insertValue = insertValue

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
