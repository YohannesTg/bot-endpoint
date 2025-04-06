import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
app.use(express.json());

const botToken = process.env.BOT_TOKEN;
if (!botToken) throw new Error("Missing BOT_TOKEN");

const bot = new Telegraf(botToken);

// Webhook URL (adjust to match your hosting platform)
const webhookUrl = `https://telegame.vercel.app/webhook/${botToken}`;

// Webhook handler for Telegram updates
app.post(`/webhook/${botToken}`, async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error handling update:", error);
    res.sendStatus(500);
  }
});

// === /start command ===

bot.start((ctx) => {
  const welcomeMessage = `🎮 Welcome ${ctx.from.first_name}!\nChoose your play mode:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.game('🎯 Solo Play', 'GuessGm')],  // Correct game button
    [Markup.button.switchToChat('👥 Play with Friends', 'GuessGm')]
  ]);

  ctx.reply(welcomeMessage, keyboard);
});

// === Game launch handler ===
// This handles when user taps "Solo Play" or inline game
bot.on('callback_query', async (ctx) => {
  const query = ctx.callbackQuery;

  if (query.game_short_name === 'GuessGm') {
    const { from, chat_instance, inline_message_id } = query;
    const mode = inline_message_id ? 'multi' : 'solo';

    const gameUrl = `https://g-game.vercel.app/?` +
      `userId=${from.id}&` +
      `chatId=${chat_instance}&` +
      `userName=${encodeURIComponent(from.first_name)}&` +
      `mode=${mode}`;

    await ctx.answerGameQuery(gameUrl);
  }
});

// === Inline query handler (for group invites) ===
bot.on('inline_query', async (ctx) => {
  const results = [{
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm'
  }];

  return ctx.answerInlineQuery(results);
});

// === Set webhook on startup ===
const setupWebhook = async () => {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log("✅ Webhook set successfully");
  } catch (error) {
    console.error("❌ Error setting webhook:", error);
  }
};
setupWebhook();

// === Start the server ===
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
