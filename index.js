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

// Updated Start Command with Proper Game Buttons
bot.start((ctx) => {
  // Send solo game with its own message context
  ctx.replyWithGame(
    'GuessGm', // Game short name configured via @BotFather
    {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.game('🎯 Solo Challenge')], // Inherits game_short_name from parent message
        [Markup.button.switchInline('👥 Invite Friends', 'multi_mode')] // Sharing trigger
      ]).reply_markup,
      caption: `🎮 Welcome ${ctx.from.first_name}! Choose your game mode:`
    }
  );
});

// Enhanced Game Query Handler
bot.on('callback_query', async (ctx) => {
  const { from, message } = ctx.callbackQuery;
  const isSolo = message?.game?.short_name === 'GuessGm'; // Direct game association check

  const gameUrl = isSolo
    ? gameUrls.solo(from.id, ctx.chat.id, from.first_name)
    : gameUrls.multi(from.id, ctx.chat.id, from.first_name);

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

// Updated Inline Query Handler for Multiplayer
bot.on('inline_query', (ctx) => {
  if (ctx.inlineQuery.query === 'multi_mode') {
    ctx.answerInlineQuery([{
      type: 'game',
      id: 'multi_game',
      game_short_name: 'GuessGm', // Same game but different URL params
      reply_markup: Markup.inlineKeyboard([
        Markup.button.url('👥 Team Profile', `https://g-game.vercel.app/team/${ctx.from.id}`)
      ])
    }]);
  }
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
