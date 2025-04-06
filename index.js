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

// Start Command with Game Buttons
bot.start((ctx) => {
  ctx.reply(
    `🎮 Welcome ${ctx.from.first_name}! Choose your game mode:`,
    Markup.inlineKeyboard([
      [
        Markup.button.game('🎯 Solo Play', 'GuessGm'),
        Markup.button.game('👥 Multiplayer', 'GuessGm')
      ]
    ])
  );
});

// Game Launch Handler
bot.on('callback_query', async (ctx) => {
  const { from, chat_instance } = ctx.callbackQuery;
  const isSolo = ctx.callbackQuery.message?.reply_markup?.inline_keyboard?.[0]?.[0]?.text.includes('Solo');
  
  // Construct game URL with parameters
  const gameUrl = new URL('https://g-game.vercel.app/');
  gameUrl.searchParams.set('userId', from.id);
  gameUrl.searchParams.set('chatId', chat_instance);
  gameUrl.searchParams.set('userName', from.first_name);
  gameUrl.searchParams.set('mode', isSolo ? 'solo' : 'multi');

  // Answer the game query
  await ctx.answerGameQuery(gameUrl.toString());

  // Send confirmation message
  await ctx.telegram.sendMessage(
    from.id,
    isSolo ? `🎮 Starting solo adventure...` : `🎉 Inviting friends to play...`,
    Markup.inlineKeyboard([
      [Markup.button.game('🔄 Play Again', 'GuessGm')]
    ])
  );
});

// Inline Query Handler
bot.on('inline_query', (ctx) => {
  ctx.answerInlineQuery([{
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm'
  }]);
});

// Webhook Setup
const setupWebhook = async () => {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('✅ Webhook configured successfully');
  } catch (error) {
    console.error('❌ Webhook setup error:', error);
  }
};

// Server Startup
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await setupWebhook();
  console.log(`🚀 Server running on port ${port}`);
});
