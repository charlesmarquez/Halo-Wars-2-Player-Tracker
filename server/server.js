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

hw2.dumpLeaderboardHistory()

setTimeout(async() => {
  currentData = db.getValues()
}, 50);

setInterval(() => {
  hw2.updatePlayers()
  hw2.dumpLeaderboardHistory()
}, 60000);

setInterval(async () => {
  currentData = await db.getValues()
}, 60000);