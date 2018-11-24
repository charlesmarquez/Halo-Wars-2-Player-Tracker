const express = require('express');
const db = require('./src/connection/db');
const halo = require('./src/halo/functions');

const app = express();
const bodyParser = require('body-parser');


const port = process.env.PORT || 5000;

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.get('/api/players', async (req, res) => {
  var data = await halo.lastplayed()
  var format_data = []

  for (const x of data) {
    format_data.push({
      player: x.player,
      timeago: x.time.timeago,
      seconds: x.time.seconds
    })
  }

  res.send(data)
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));