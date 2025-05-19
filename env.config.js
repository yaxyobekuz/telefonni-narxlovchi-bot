require("dotenv").config();

const bot_token = process.env.TOKEN;
const mongodb_url = process.env.MONGODB_URL;

module.exports = { bot_token, mongodb_url };
