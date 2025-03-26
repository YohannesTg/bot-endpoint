const express = require('express'); 
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');

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

// Set the webhook properly
(async () => {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log("Webhook set successfully");
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
})();

// Handle inline query to return the game
bot.on('inline_query', async (ctx) => {
  const game = {
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm', // Ensure this matches your Telegram game short name
  };

  return ctx.answerInlineQuery([game]);
});

// Handle callback queries for launching the game
bot.on('callback_query', async (ctx) => {
  console.log("Game started by user:", ctx.callbackQuery.from.id);
  
  // Answer the callback query to launch the game directly
  await ctx.answerCbQuery();
});

// Start the Express server (no fixed port for Vercel)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
