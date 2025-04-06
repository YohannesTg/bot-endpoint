import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
app.use(express.json());

const botToken = process.env.BOT_TOKEN;
if (!botToken) throw new Error("Missing BOT_TOKEN");
const bot = new Telegraf(botToken);

// Webhook Setup
const webhookUrl = `https://telegame.vercel.app/webhook/${botToken}`;
app.post(`/webhook/${botToken}`, async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error handling update:", error);
    res.sendStatus(500);
  }
});

// Start Command with PROPER GAME BUTTON
bot.start((ctx) => {
  const welcomeMessage = `🎮 Welcome ${ctx.from.first_name}!\nChoose your play mode:`;
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.game('🎯 Solo Play', false)], // <-- CORRECT SYNTAX
    [Markup.button.switchToChat('👥 Play with Friends', 'GuessGm')]
  ]);
  ctx.reply(welcomeMessage, keyboard);
});

// Unified Game Handler
bot.on('callback_query', async (ctx) => {
  if (ctx.callbackQuery.game_short_name === 'GuessGm') {
    const { from, chat_instance } = ctx.callbackQuery;
    const mode = ctx.callbackQuery.inline_message_id ? 'multi' : 'solo';
    
    const gameUrl = `https://g-game.vercel.app/?` +
      `userId=${from.id}&` +
      `chatId=${chat_instance}&` +
      `userName=${encodeURIComponent(from.first_name)}&` +
      `mode=${mode}`;

    await ctx.answerGameQuery(gameUrl);
  }
});

// Inline Query Handler (Multiplayer)
bot.on('inline_query', async (ctx) => {
  const results = [{
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm',
    reply_markup: Markup.inlineKeyboard([
      Markup.button.game('🎮 Play Now', 'GuessGm')
    ])
  }];
  
  return ctx.answerInlineQuery(results);
});

// Webhook Setup
const setupWebhook = async () => {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log("✅ Webhook set successfully");
  } catch (error) {
    console.error("❌ Error setting webhook:", error);
  }
};
setupWebhook();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
