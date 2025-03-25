const express = require('express'); 
const bodyParser = require('body-parser');
const { Telegraf, Markup } = require('telegraf');

const app = express();
app.use(bodyParser.json());

// Use environment variables for security
const botToken = '7663415602:AAHYqRDRVwntaokbWu_XkyRmkUHSuQmBJLQ';
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
  const userId = ctx.callbackQuery.from.id;
  const userName = encodeURIComponent(ctx.callbackQuery.from.first_name);
  const gameUrl = `https://g-game.vercel.app/?userId=${userId}&userName=${userName}`;

  console.log(`User ID: ${userId}`);

  // Answer the callback query first
  await ctx.answerCbQuery();

  // Send the game only in private chat
  if (ctx.chat && ctx.chat.type === "private") {
    await ctx.telegram.sendGame(ctx.chat.id, "GuessGm");
  } else {
    await ctx.reply("Please start the game in a private chat.");
  }
});

// Start the Express server (no fixed port for Vercel)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
