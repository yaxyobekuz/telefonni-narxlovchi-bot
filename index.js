const bot = require("./src/bot");
const express = require("express");
const { users } = require("./src/db");
const user_actions = require("./src/actions/user");

bot.on("message", async ({ from, text: message, chat, contact }) => {
  const chat_id = chat.id;

  if (!users[chat_id]) {
    users[chat_id] = { ...from, language_code: null };
  }

  user_actions({
    from,
    chat,
    contact,
    text: message,
    user: users[chat_id],
  });
});
