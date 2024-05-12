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

  // Create the inline keyboard with the game button
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: 'Play Game',
          url: 'https://google.com' // Replace with your game URL
        }
      ]
    ]
  };

  // Send the game with the inline keyboard to the user
  bot.sendGame(chatId, 'GuessGm', {
    reply_markup: JSON.stringify(inlineKeyboard)
  });

  res.sendStatus(200); // Send a success response
});

app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});
