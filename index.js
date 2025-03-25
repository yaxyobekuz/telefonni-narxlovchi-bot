// Bot configuration
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TOKEN, { polling: true });

// Utils
const { formatMessage } = require("./src/utils");

// Bot listeners

// /start command line
bot.onText(/\/start/, (msg) => {
  const message = msg.text;
  const chatId = msg.chat.id;

  console.log(msg);
  
});

// Message listeners
bot.on("message", async (msg) => {
  const message = msg.text;
  const chatId = msg.chat.id;
});

// Callback query listeners
bot.on("callback_query", async (query) => {
  const queryData = query.data;
  const chatId = query.message.chat.id;
});
