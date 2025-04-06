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

// Enhanced Start Command
bot.start((ctx) => {
  const welcomeMessage = `🎮 Welcome ${ctx.from.first_name}!\nChoose your play mode:`;
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🎯 Solo Play', 'play_solo')],
    [Markup.button.switchToChat('👥 Play with Friends', 'GuessGm')]
  ]);
  ctx.reply(welcomeMessage, keyboard);
});

// Solo Play Handler with User Parameters
bot.action('play_solo', async (ctx) => {
  const { from, chat_instance } = ctx.callbackQuery;
  const soloUrl = `https://g-game.vercel.app/solo?userId=${from.id}&chatId=${chat_instance}&userName=${encodeURIComponent(from.first_name)}`;

  await ctx.editMessageText(
    `🎮 Starting Solo Game for ${from.first_name}...\nTap below to begin!`,
    Markup.inlineKeyboard([
      Markup.button.url('🚀 Start Solo Game', soloUrl)
    ])
  );
  
  await ctx.answerCbQuery();
});

// Multiplayer Game Handler
bot.on('callback_query', async (ctx) => {
  if (ctx.callbackQuery.game_short_name === 'GuessGm') {
    const { from, chat_instance } = ctx.callbackQuery;
    const gameUrl = `https://g-game.vercel.app/?userId=${from.id}&chatId=${chat_instance}&userName=${encodeURIComponent(from.first_name)}`;

    await ctx.answerGameQuery(gameUrl);
    
    await ctx.telegram.sendMessage(
      from.id,
      `🎉 Challenge sent to chat!\nWaiting for players...`,
      Markup.inlineKeyboard([
        [Markup.button.url('Game Dashboard', gameUrl)],
        [Markup.button.callback('🚀 Start Solo Game', 'play_solo')]
      ])
    );
  }
});

// Inline Query Handler
bot.on('inline_query', async (ctx) => {
  const results = [{
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm',
    reply_markup: Markup.inlineKeyboard([
      Markup.button.url('🎮 Solo Play', `https://g-game.vercel.app/solo?userId=${ctx.from.id}&userName=${encodeURIComponent(ctx.from.first_name)}`)
    ])
  }];
  
  return ctx.answerInlineQuery(results);
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
