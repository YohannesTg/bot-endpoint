const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(bodyParser.json());

// Set up your bot token
const botToken = '7004677225:AAH_qVX9NO0CRxpMnw0t1Jz52ez9HqunN9I';
const bot = new TelegramBot(botToken, { polling: false });

app.post('/telegram', (req, res) => {
  const jsonData = req.body;
  const chatId = jsonData.message.chat.id;
  const message = jsonData.message.text; // Get the text of the received message

  // Send the received message back to the user
  bot.sendMessage(chatId, message);
  res.sendStatus(200); // Send a success response
});


app.listen(8443, () => {
  console.log('Express server is running on port 3000');
});
