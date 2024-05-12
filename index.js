const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(bodyParser.json());

// Set up your bot token
const botToken = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(botToken, { polling: false });

app.post('/telegram', (req, res) => {
  const jsonData = req.body;
  const chatId = jsonData.message.chat.id;
  const message = jsonData.message.text; // Get the text of the received message

  // Create an inline keyboard with a button
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: 'Click me',
          callback_data: 'button_clicked'
        }
      ]
    ]
  };

  // Send the received message back to the user with the inline keyboard
  bot.sendMessage(chatId, message, {
    reply_markup: JSON.stringify(keyboard)
  });

  res.sendStatus(200); // Send a success response
});

app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});
