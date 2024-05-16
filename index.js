const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf, Markup, ExtraMarkup } = require('telegraf');

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
bot.command("inline", (ctx) => {
    ctx.reply("Hi there!", {
        reply_markup: {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [ { text: "Button 1", callback_data: "btn-1" }, { text: "Button 2", callback_data: "btn-2" } ],

                /* One button */
                [ { text: "Next", callback_data: "next" } ],
                
                /* Also, we can have URL buttons. */
                [ { text: "Open in browser", url: "telegraf.js.org" } ]
            ]
        }
    });
});
bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query;

  // Create an inline game
  const keyboard = ExtraMarkup.inlineKeyboard([
    ExtraMarkup.button.url("Play Game", "tg://google.com")
  ]);
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
