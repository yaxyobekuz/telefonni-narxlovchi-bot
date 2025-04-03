const { bot_token } = require("../env.config");
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(bot_token, { polling: true });

module.exports = bot;
