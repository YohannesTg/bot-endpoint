const express = require('express');
const bodyParser = require('body-parser');
const { Bot } = require('node-telegram-bot-api-wrapper');

const app = express();
app.use(bodyParser.json());

// Set up your bot token
const botToken = '7004677225:AAH_qVX9NO0CRxpMnw0t1Jz52ez9HqunN9I';
const bot = new Bot(botToken);

app.post('/telegram', (req, res) => {
  const jsonData = req.body;
  const inlineQueryId = jsonData.inline_query.id;

  // Create the inline keyboard with the game button and URL
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

  // Create the Inline Query Result Game
  const inlineQueryResultGame = {
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm',
    reply_markup: JSON.stringify(inlineKeyboard)
  };

  // Send the Inline Query Result Game with the inline keyboard to the user
  bot.answerInlineQuery(inlineQueryId, [inlineQueryResultGame]);

  res.sendStatus(200); // Send a success response
});

app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});

// Start the bot
bot.startPolling();
