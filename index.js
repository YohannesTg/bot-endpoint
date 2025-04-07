import express from 'express';
import { Telegraf, Markup } from 'telegraf';

const app = express();
app.use(express.json());

const botToken = process.env.BOT_TOKEN;
if (!botToken) throw new Error("Missing BOT_TOKEN");
const bot = new Telegraf(botToken);

// Webhook Configuration
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

// Game Session Configuration
const gameUrls = {
  solo: (userId, chatId, userName) => 
    `https://g-game.vercel.app/solo?userId=${userId}&chatId=${chatId}&userName=${encodeURIComponent(userName)}`,
  multi: (userId, chatId, userName) =>
    `https://g-game.vercel.app/?userId=${userId}&chatId=${chatId}&userName=${encodeURIComponent(userName)}&mode=multi`
};

// Interactive Start Command
bot.start((ctx) => {
  ctx.reply(
    `🎮 Welcome ${ctx.from.first_name}! Choose your game mode:`,
    Markup.inlineKeyboard([
      [
        Markup.button.game('🎯 Solo Challenge'),
        Markup.button.game('👥 Play with Partner')
      ]
    ])
  );
});

// Unified Game Handler
bot.on('callback_query', async (ctx) => {
  const { from, chat_instance } = ctx.callbackQuery;
  const isSolo = ctx.callbackQuery.message?.reply_markup?.inline_keyboard?.[0]?.[0]?.text.includes('Solo');

  const gameUrl = isSolo 
    ? gameUrls.solo(from.id, chat_instance, from.first_name)
    : gameUrls.multi(from.id, chat_instance, from.first_name);

  await ctx.answerGameQuery(gameUrl);

  await ctx.telegram.sendMessage(
    from.id,
    `${isSolo ? '🎮 Solo session' : '👥 Partner session'} started!`,
    Markup.inlineKeyboard([
      [Markup.button.game('🔄 Play Again', 'GuessGm')],
      [Markup.button.url('📊 View Progress', `https://g-game.vercel.app/stats/${from.id}`)]
    ])
  );
});

// Inline Query Handler
bot.on('inline_query', (ctx) => {
  ctx.answerInlineQuery([{
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm',
    reply_markup: Markup.inlineKeyboard([
      Markup.button.url('🌟 Player Profile', `https://g-game.vercel.app/profile/${ctx.from.id}`)
    ])
  }]);
});

// Server Setup
const setupWebhook = async () => {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('✅ Webhook configured:', webhookUrl);
  } catch (error) {
    console.error('❌ Webhook setup failed:', error);
  }
};

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await setupWebhook();
  console.log(`🚀 Server running on port ${port}`);
});
