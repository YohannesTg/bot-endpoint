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

// Interactive Start Command
bot.start((ctx) => {
  const welcomeMessage = `👋 Hello ${ctx.from.first_name}! 💝 Ready to play a fun game with your beloved? Let's get started!`;
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🎮 Play Now', 'play_game')],
    [Markup.button.callback('💌 Share with Partner', 'share_game')]
  ]);
  ctx.reply(welcomeMessage, keyboard);
});

// Play Game Handler
bot.action('play_game', async (ctx) => {
  await ctx.replyWithGame('GuessGm');
  await ctx.reply(`💖 Share the fun with your beloved!`, 
    Markup.inlineKeyboard([
      Markup.button.callback('💌 Share Game', 'share_game')
    ])
  );
  await ctx.answerCbQuery();
});

// Share Game Handler
bot.action('share_game', async (ctx) => {
  const shareMessage = `💞 Spread the love! Click below to share GuessGm:`;
  const shareButton = Markup.inlineKeyboard([
    Markup.button.switchToCurrentChat('🔗 Share Game Now', 'GuessGm')
  ]);
  await ctx.reply(shareMessage, shareButton);
  await ctx.answerCbQuery();
});

// Existing Game Features
bot.on('inline_query', async (ctx) => {
  const game = {
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm',
  };
  return ctx.answerInlineQuery([game]);
});

bot.on('callback_query', async (ctx) => {
  const { id, from, chat_instance } = ctx.callbackQuery;
  const gameUrl = `https://g-game.vercel.app/?userId=${from.id}&chatId=${chat_instance}&userName=${from.first_name}`;

  await ctx.answerGameQuery(gameUrl);
  
  // Post-game sharing prompt
  await ctx.telegram.sendMessage(
    from.id,
    `🎉 Hope you enjoyed the game, ${from.first_name}! Share it with someone special!`,
    Markup.inlineKeyboard([
      Markup.button.callback('💌 Share Again', 'share_game')
    ])
  );
});

// Server Initialization
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
