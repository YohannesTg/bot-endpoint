const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(bodyParser.json());

// Set up your bot token
const botToken = '7004677225:AAEvp1tFSgiIXkQqkCp5mkB6tRScWhcdnAs';
const bot = new TelegramBot(botToken, { polling: true });

app.post('/telegram', (req, res) => {
  const jsonData = req.body;
  // Process the JSON data from the Telegram bot
  // ...

  // Send a message using the sendMessage method
  const chatId = jsonData.message.chat.id;
  const message = 'Hello from your Telegram bot!';
  bot.sendMessage(chatId, message);

  res.sendStatus(200); // Send a success response
});

app.listen(3000, () => {
  console.log('Express server is running on port 3000');
});
