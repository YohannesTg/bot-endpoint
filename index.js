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
  const welcomeMessage = `🎉 Welcome, ${ctx.from.first_name}! Are you ready to test your number-guessing skills? Let's play "Guess My Number" 🧩!\n\nYou can play against your friends, guess numbers, and try to beat the competition. Choose your play mode below:`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🎯 Play with Friends', 'play_friends')],
    [Markup.button.callback('🌟 View Game Stats', 'view_stats')],
    [Markup.button.callback('🔔 About the Game', 'game_info')]
  ]);

  ctx.reply(welcomeMessage, keyboard);
});

// Play with Friends Handler
bot.action('play_friends', async (ctx) => {
  const { from } = ctx.callbackQuery;
  const gameUrl = `https://g-game.vercel.app/?userId=${from.id}&userName=${encodeURIComponent(from.first_name)}`;

  await ctx.editMessageText(
    `🚀 Ready to guess, ${from.first_name}? Challenge your friends in a fun game of "Guess My Number"! Each of you will try to guess the correct number based on the clues.\n\nGet your friends to join and start competing!`,
    Markup.inlineKeyboard([
      [Markup.button.url('🎮 Start Playing Now', gameUrl)],
      [Markup.button.callback('🔄 Challenge Again', 'play_friends')]
    ])
  );

  await ctx.answerCbQuery();
});

// Game Info Handler (Now reflects "Guess My Number")
bot.action('game_info', async (ctx) => {
  const gameInfo = `
    🌟 **About "Guess My Number"**:
    - A fun and challenging multiplayer game where players take turns guessing a secret number.
    - For each guess, you get feedback on how many digits are correct and in the correct position (like "Bulls and Cows").
    - The first player to guess the correct number wins! Can you guess the number before your friends? 👑
  `;

  await ctx.editMessageText(gameInfo, {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback('🎯 Play with Friends', 'play_friends')],
      [Markup.button.callback('❌ Close', 'close_game')]
    ])
  });

  await ctx.answerCbQuery();
});

// Close Game Handler
bot.action('close_game', async (ctx) => {
  await ctx.editMessageText('🚪 Game session closed. Hope you had fun! Come back soon for more challenges! 🎮');
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
