const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf, Markup } = require('telegraf');

const app = express();
app.use(bodyParser.json());

// Set up your bot token
const botToken = '7004677225:AAH_qVX9NO0CRxpMnw0t1Jz52ez9HqunN9I';
const bot = new Telegraf(botToken);

// Set up the webhook URL
const webhookUrl = `https://telegame.vercel.app/webhook/${botToken}`
// Set up the webhook route
app.post(`/webhook/${botToken}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Set the webhook
bot.telegram.setWebhook(webhookUrl);

// Start the bot
bot.startWebhook(`/webhook/${botToken}`, null, 8443);

// Handle incoming text messages
bot.on('text', (ctx) => {
  const message = ctx.message.text;
  
  // Reply to the user's message
  ctx.reply(`You said: ${message}`);
});

bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query;
  
  // Create an inline keyboard

  // Create an inline game
const keyboard = Markup.inlineKeyboard([
    Markup.button.url("Play Game", "tg://google.com")
  ]);

  // Create an inline game
  const game = {
    type: 'game',
    id: '2',
    game_short_name: 'GuessGm',
    reply_markup: keyboard
  };
  
  // Answer the inline query with an inline keyboard and game
  await ctx.answerInlineQuery([game]);
});


app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});
