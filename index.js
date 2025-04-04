// Bot
const bot = require("./src/bot");

// Express
const express = require("express");

// DataBase
const { users } = require("./src/db");

// Actions
const user_actions = require("./src/actions/user");
const admin_actions = require("./src/actions/admin");

// Message Listener
bot.on("message", async ({ from, text: message, chat, contact }) => {
  const chat_id = chat.id;

  if (!users[chat_id]) {
    users[chat_id] = { ...from, language_code: null };
  }

  const options = {
    chat,
    from,
    contact,
    text: message,
    user: users[chat_id],
  };

  if (["owner", "admin"].includes(users[chat_id]?.status)) {
    admin_actions(options);
  } else {
    user_actions(options);
  }
});
