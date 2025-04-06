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

// Enhanced Start Command with Friend Selection
bot.start((ctx) => {
  const welcomeMessage = `🎮 Welcome ${ctx.from.first_name}! 💖\nPlay alone or challenge someone special:`;
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🎯 Play Solo', 'play_solo')],
    [Markup.button.switchToChat('👥 Play with Friends', 'GuessGm')]
  ]);
  ctx.reply(welcomeMessage, keyboard);
});

// Solo Play Handler
bot.action('play_solo', async (ctx) => {
  await ctx.replyWithGame('GuessGm');
  await ctx.answerCbQuery();
  await ctx.reply(
    `❤️ Having fun? Share with someone special!`,
    Markup.inlineKeyboard([
      Markup.button.switchToChat('👫 Challenge a Friend', 'GuessGm')
    ])
  );
});

// Inline Game Handler (for friend selection)
bot.on('inline_query', async (ctx) => {
  const game = {
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm',
  };
  return ctx.answerInlineQuery([game]);
});

// Game Launch Handler
bot.on('callback_query', async (ctx) => {
  const { id, from, chat_instance } = ctx.callbackQuery;
  const gameUrl = `https://g-game.vercel.app/?userId=${from.id}&chatId=${chat_instance}&userName=${from.first_name}`;
  
  await ctx.answerGameQuery(gameUrl);
  
  // Send confirmation to both players
  await ctx.telegram.sendMessage(
    from.id,
    `🎉 Game sent successfully! Waiting for your friend to join...`,
    Markup.inlineKeyboard([
      Markup.button.url('🔗 Game Link', gameUrl)
    ])
  );
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
