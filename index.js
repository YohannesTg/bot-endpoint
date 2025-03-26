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
  const userId = ctx.callbackQuery.from.id;
  console.log(`🎮 Game started by User ID: ${userId}`);

  // Answer callback query to allow game launch
  await ctx.answerCbQuery();

  // Start the game in Telegram
  await ctx.telegram.sendGame(userId, "GuessGm"); // Ensure "GuessGm" is your registered game name
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
