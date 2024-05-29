const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf, Markup} = require('telegraf');


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

bot.on('inline_query', (ctx) => {
  const query = ctx.inlineQuery.query; // Access the query string from the context object

  // Generate the inline query results
  const game = {
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Play Now', callback_game: {} }]
      ],
    },
  };

  // Send the inline query results back to the user
  return ctx.answerInlineQuery([game]);
});
bot.on('callback_query', async (ctx) => {
  
  const callbackQueryId = ctx.callbackQuery.id;
  const userId = ctx.callbackQuery.from.id;
  const chatId = ctx.callbackQuery.chat_instance;
  const gameUrl = `https://yohanz.com.et/index.php?userId=${userId}&chatId=${chatId}`;

  console.log(`User ID: ${userId}`);
  console.log(`Chat ID: ${chatId}`);
  // Answer the callback query with the game URL
  await ctx.answerGameQuery(gameUrl);
});

app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});
