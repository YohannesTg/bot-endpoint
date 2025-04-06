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

// Start Command with Modern Style
bot.start((ctx) => {
  const welcomeMessage = `🎉 Welcome, ${ctx.from.first_name}! Ready to challenge your friends in "Guess My Number"? 🧩 It's a fun multiplayer game where you guess numbers based on feedback! Choose your play mode below:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🎯 Play with Friends', 'play_friends')]
  ]);

  ctx.reply(welcomeMessage, keyboard);
});

// Play with Friends Handler
bot.action('play_friends', async (ctx) => {
  const { from } = ctx.callbackQuery;
  const gameUrl = `https://g-game.vercel.app/?userId=${from.id}&userName=${encodeURIComponent(from.first_name)}`;

  await ctx.editMessageText(
    `🚀 Ready to guess, ${from.first_name}? Challenge your friends in "Guess My Number"! You will take turns guessing numbers. Each guess gives you feedback to help you narrow down the correct answer.\n\nTo send the game to your friends, use the button below!`,
    Markup.inlineKeyboard([
      [Markup.button.url('🎮 Share the Game', gameUrl)],
      [Markup.button.callback('🔄 Challenge Again', 'play_friends')]
    ])
  );

  await ctx.answerCbQuery();
});

// Inline Query Handler (Multiplayer)
bot.on('inline_query', async (ctx) => {
  const results = [{
    type: 'game',
    id: '1',
    game_short_name: 'GuessGm', // Assuming 'GuessGm' is the game short name for your game
    reply_markup: Markup.inlineKeyboard([
      Markup.button.url('🎮 Play Now', `https://g-game.vercel.app/?userId=${ctx.from.id}&userName=${encodeURIComponent(ctx.from.first_name)}`)
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
