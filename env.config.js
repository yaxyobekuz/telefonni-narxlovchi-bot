require("dotenv").config();

const bot_token = process.env.TOKEN;
const security_token = process.env.SECURITY_TOKEN;

module.exports = { bot_token, security_token };
