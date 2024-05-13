const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');

const app = express();
app.use(bodyParser.json());

const botToken = '7004677225:AAH_qVX9NO0CRxpMnw0t1Jz52ez9HqunN9I';
const bot = new Telegraf(botToken);

app.post('/telegram', (req, res) => {
  const jsonData = req.body;
  bot.handleUpdate(jsonData);
  res.sendStatus(200);
});

app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});
