const express = require('express'); 
const bodyParser = require('body-parser');
const { Telegraf, Markup } = require('telegraf');

const app = express();
app.use(bodyParser.json());

// Use environment variables for security
const botToken = process.env.BOT_TOKEN || '7663415602:AAHYqRDRVwntaokbWu_XkyRmkUHSuQmBJLQ';
const bot = new Telegraf(botToken);

// Webhook URL (change to your actual deployed domain)
const webhookUrl = `https://telegame.vercel.app/webhook/${botToken}`;

// Set up the webhook route
app.post(`/webhook/${botToken}`, async (req, res) => {
  await bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Set the webhook after defining the route
bot.telegram.setWebhook(webhookUrl);

// Handle "/inline" command with buttons
bot.command("inline", (ctx) => {
    ctx.reply("Hi there!", {
        reply_markup: {
            inline_keyboard: [
                [ { text: "Button 1", callback_data: "btn-1" }, { text: "Button 2", callback_data: "btn-2" } ],
                [ { text: "Next", callback_data: "next" } ],
                [ { text: "Open in browser", url: "https://telegraf.js.org" } ]
            ]
        }
    });
});

// Handle inline query for the game
bot.on('inline_query', async (ctx) => {
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
  return ctx.answerInlineQuery([game]);
});

// Handle callback queries (Game launch)
bot.on('callback_query', async (ctx) => {
  
  const callbackQueryId = ctx.callbackQuery.id;
  const userId = ctx.callbackQuery.from.id;
  const chatId = ctx.callbackQuery.chat_instance;
  const userName = ctx.callbackQuery.from.first_name;
  const gameUrl = `https://g-game.vercel.app/?userId=${userId}&chatId=${chatId}&userName=${userName}`;

  console.log(User ID: ${userId});
  console.log(Chat ID: ${chatId});
  // Answer the callback query with the game URL
  await ctx.answerGameQuery(gameUrl);
});

// Start the Express server (no fixed port for Vercel)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
