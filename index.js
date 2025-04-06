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

// Unified Game Start Command (Fixed Markup)
bot.start((ctx) => {
  ctx.reply(
    `🎮 Welcome ${ctx.from.first_name}! Choose your mode:`,
    Markup.inlineKeyboard([
      [
        Markup.button.game('🎯 Solo Play', 'GuessGm'),
        Markup.button.game('👥 Play with Friends', 'GuessGm')
      ]
    ]).extra()
  );
});

// Game Launch Handler (Improved Safety)
bot.on('callback_query', async (ctx) => {
  const { from, chat_instance } = ctx.callbackQuery;
  const isSolo = ctx.callbackQuery.message?.reply_markup?.inline_keyboard?.[0]?.[0]?.text === '🎯 Solo Play';
  
  const gameUrl = `https://g-game.vercel.app/?` +
    `userId=${from.id}&` +
    `chatId=${chat_instance}&` +
    `userName=${encodeURIComponent(from.first_name)}&` +
    `mode=${isSolo ? 'solo' : 'multi'}`;

  await ctx.answerGameQuery(gameUrl);

  // Send game confirmation (Fixed Markup)
  await ctx.telegram.sendMessage(
    from.id,
    isSolo ? `🎮 Solo game starting...` : `🎉 Game invite sent to chat!`,
    Markup.inlineKeyboard([
      [Markup.button.game('🔄 Play Again', 'GuessGm')]
    ]).extra()
  );
});

// Inline Query Handler
bot.on('inline_query', async (ctx) => {
  return ctx.answerInlineQuery([{
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm'
  }]);
});

// Webhook and Server Setup
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
