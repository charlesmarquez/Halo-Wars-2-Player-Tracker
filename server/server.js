const express = require('express');
const db = require('./src/connection/db');
const hw2 = require('./src/halo/functions');

const app = express();
app.use(express.json()); // if needed
const port = process.env.PORT || 5000;

app.get('/api/hello', (req, res) => {
  res.send({
    express: 'Hello From Express'
  });
});

app.post('/api/world', (req, res) => {
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.get('/api/players', async (req, res) => {
  // console.time('db.getValues')
  // data = await db.getValues()
  // console.timeEnd('db.getValues')
  res.send(getData())
});

app.post('/api/matchevents', async (req, res) => {
  props = req.body.post
  data = await hw2.matchEvents(props.row.original.history.MatchId)
  res.send(data)
})

app.post('/api/addplayer', (req, res) => {
  var playerName = req.body.post

  hw2.getValidName(playerName).then(async (result) => {
    var db_bool = await db.insertValue({
      _id: result,
      gamertag: result
    })
    console.log(db_bool);

    if (db_bool) {
      res.send(`${result} successfully added to database.`)
    } else {
      res.send(`${result} already exists in database.`)
    }
  }).catch((err) => {
    success = false
    res.send(err)
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

currentData = {}

function getData() {
  return currentData
}

setTimeout(async () => {
  hw2.dumpLeaderboardHistory('548d864e-8666-430e-9140-8dd2ad8fbfcd')
  hw2.dumpLeaderboardHistory('379f9ee5-92ec-45d9-b5e5-9f30236cab00')
  hw2.dumpLeaderboardHistory('4a2cedcc-9098-4728-886f-60649896278d')
  currentData = await db.getValues()
}, 50);

setInterval(() => {
  hw2.dumpLeaderboardHistory('548d864e-8666-430e-9140-8dd2ad8fbfcd')
  hw2.dumpLeaderboardHistory('379f9ee5-92ec-45d9-b5e5-9f30236cab00')
  hw2.dumpLeaderboardHistory('4a2cedcc-9098-4728-886f-60649896278d')
}, 300000);

setInterval(async () => {
  currentData = await db.getValues()
}, 120000);