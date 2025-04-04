// Bot
const bot = require("./src/bot");

// Utils
const { check_auth } = require("./src/utils");

// DataBase
const { users, admins } = require("./src/db");

// Actions
const user_actions = require("./src/actions/user");
const admin_actions = require("./src/actions/admin");

// Express (For API)
const express = require("express");
const rate_limit = require("express-rate-limit");
const app = express();

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

  if (admins[chat_id]) {
    admin_actions(options);
  } else {
    user_actions(options);
  }
});

// Rate limiting middleware
const limiter = rate_limit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Bu IPdan so'rovlar juda ko'p, keyinroq qayta urinib ko'ring.",
});

app.use(limiter);

// Pagination endpoint
app.get("/api/data", check_auth, (req, res) => {
  try {
    const page_size = 1000;
    const { page = 1 } = req.query;
    const page_index = parseInt(page);

    if (isNaN(page_index) || page_index <= 0) {
      return res
        .status(400)
        .json({ error: "Noto'g'ri sahifa raqami kiritildi!" });
    }

    // Extract users and apply pagination
    const data_keys = Object.keys(users);
    const total_pages = Math.ceil(data_keys.length / page_size);

    if (page_index > total_pages) {
      return res
        .status(400)
        .json({ error: "Sahifa raqami jami sahifalardan ko'p!" });
    }

    const start_index = (page_index - 1) * page_size;
    const paginated_data_keys = data_keys.slice(
      start_index,
      start_index + page_size
    );

    // Prepare paginated response users
    const paginated_data = {};
    paginated_data_keys.forEach((key) => {
      paginated_data[key] = users[key];
    });

    // Send response with total pages and users
    res.json({
      page_index,
      total_pages,
      users: paginated_data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ichki server xatosi" });
  }
});

app.listen(3000, () => {
  console.log("Server 3000-portda ishga tushdi");
});
