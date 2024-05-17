const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf, Markup, ExtraMarkup } = require('telegraf');

const app = express();
app.use(bodyParser.json());

// Set up your bot token
const botToken = '7004677225:AAH_qVX9NO0CRxpMnw0t1Jz52ez9HqunN9I';
const bot = new Telegraf(botToken);

// Set up the webhook URL
const webhookUrl = `https://telegame.vercel.app/webhook/${botToken}`
// Set up the webhook route
app.post(`/webhook/${botToken}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Set the webhook
bot.telegram.setWebhook(webhookUrl);

// Start the bot
bot.startWebhook(`/webhook/${botToken}`, null, 8443);

// Handle incoming text messages
bot.command("inline", (ctx) => {
    ctx.reply("Hi there!", {
        reply_markup: {
            inline_keyboard: [
                /* Inline buttons. 2 side-by-side */
                [ { text: "Button 1", callback_data: "btn-1" }, { text: "Button 2", callback_data: "btn-2" } ],

                /* One button */
                [ { text: "Next", callback_data: "next" } ],
                
                /* Also, we can have URL buttons. */
                [ { text: "Open in browser", url: "telegraf.js.org" } ]
            ]
        }
    });
});
bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query;

  // Create an inline game button
  const gameButton = Markup.button.game('Play Game');

  // Create an inline keyboard with a link button
  const inlineKeyboard = Markup.inlineKeyboard([
    [Markup.button.url('Visit Website', 'https://example.com')]
  ]);

  // Create a game message
  const gameMessage = {
    type: 'game',
    id: '2',
    game_short_name: 'GuessGm',
    reply_markup: inlineKeyboard
  };

  // Create an array of results
  const results = [
    {
      type: 'article',
      id: '1',
      title: 'Play Game',
      input_message_content: gameMessage,
      reply_markup: Markup.inlineKeyboard([[gameButton]])
    }
  ];

  // Answer the inline query with the game button
  await ctx.answerInlineQuery(results);
});


app.listen(8443, () => {
  console.log('Express server is running on port 8443');
});
