import express from 'express';
import { Telegraf } from 'telegraf';

const app = express();
app.use(express.json()); // Use built-in JSON parsing

// Use environment variables for security
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error("Missing BOT_TOKEN in environment variables.");
}

const bot = new Telegraf(botToken);

// Webhook URL (Change this to your actual deployed domain)
const webhookUrl = `https://telegame.vercel.app/webhook/${botToken}`;

// Webhook route
app.post(`/webhook/${botToken}`, async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error handling update:", error);
    res.sendStatus(500);
  }
});

// Set up the webhook
const setupWebhook = async () => {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log("✅ Webhook set successfully");
  } catch (error) {
    console.error("❌ Error setting webhook:", error);
  }
};
setupWebhook();

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
  const callbackQueryId = ctx.callbackQuery.id;
  const userId = ctx.callbackQuery.from.id;
  const chatId = ctx.callbackQuery.chat_instance;
  const userName = ctx.callbackQuery.from.first_name;
  const gameUrl = `https://g-game.vercel.app/?userId=${userId}&chatId=${chatId}&userName=${userName}`;

  console.log(`User ID: ${userId}`);
  console.log(`Chat ID: ${chatId}`);

  // Answer the callback query to let Telegram know the request was processed
  await ctx.answerGameQuery(gameUrl);

  // Optionally, you could send a follow-up message or trigger the game (if needed)
  // await ctx.telegram.sendMessage(userId, `Click here to play the game: ${gameUrl}`);
});


// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
