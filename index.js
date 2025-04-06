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

// Stylish Start Command
bot.start((ctx) => {
  ctx.replyWithSticker('CAACAgIAAxkBAAEL3NhmmdR6Q9VvAAE6QbQ7xq0p9VXbDosAAhUAA8A2TxMX-dh4AAIFSNA0MA')
    .then(() => {
      ctx.reply(
        `🌟 *Hey ${ctx.from.first_name}!* 🌟\nReady for an epic challenge?`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.game('🚀 Launch Cosmic Challenge', 'GuessGm')],
            [Markup.button.url('📊 Leaderboards', 'https://your-leaderboard-link.com')]
          ])
        }
      );
    });
});

// Dynamic Game Handler
bot.on('callback_query', async (ctx) => {
  const { from, chat_instance } = ctx.callbackQuery;
  
  // Generate unique session ID
  const sessionId = Math.random().toString(36).substr(2, 9);
  const gameUrl = `https://g-game.vercel.app/?` +
    `session=${sessionId}&` +
    `uid=${from.id}&` +
    `cid=${chat_instance}&` +
    `uname=${encodeURIComponent(from.first_name)}&` +
    `ref=TG`;

  await ctx.answerGameQuery(gameUrl);

  // Send animated confirmation
  await ctx.telegram.sendMessage(
    from.id,
    `🎮 *Game Portal Activated!* 🕹️\n` +
    `Prepare for liftoff, *${from.first_name}*!\n` +
    `_Share the excitement below_ 👇`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.switchToChat('🔗 Invite Allies', 'CosmicGame')],
        [Markup.button.url('🎮 Direct Access', gameUrl)]
      ])
    }
  );
});

// Inline Query Handler with Flair
bot.on('inline_query', (ctx) => {
  ctx.answerInlineQuery([
    {
      type: 'game',
      id: 'cosmic_001',
      game_short_name: 'CosmicGame',
      title: '🚀 Cosmic Challenge',
      description: 'Battle across the stars!',
      photo_url: 'https://your-cdn.com/space-game-preview.jpg'
    }
  ], {
    cache_time: 0,
    is_personal: true
  });
});

// Webhook Setup
const setupWebhook = async () => {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('🌌 Webhook Connected to Telegram Orbit');
  } catch (error) {
    console.error('⚠️ Cosmic Connection Failed:', error);
  }
};

// Server Launch Sequence
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  await setupWebhook();
  console.log(`🚀 Server warping through port ${port}`);
});
