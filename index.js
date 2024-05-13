const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');

const app = express();
app.use(bodyParser.json());

// Set up your bot token
const botToken = '7004677225:AAH_qVX9NO0CRxpMnw0t1Jz52ez9HqunN9I';
const bot = new Telegraf(botToken);

bot.on('text', (ctx) => {
  const jsonData = ctx.update.message;
  const chatId = jsonData.chat.id;
  const message = jsonData.text; // Get the text of the received message

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
  ctx.reply(message, {
    reply_markup: JSON.stringify(keyboard)
  });
});

bot.launch();

app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});
