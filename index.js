const bot = require("./src/bot");
const { admins } = require("./src/db");
const User = require("./src/models/User");
const Stats = require("./src/models/Stats");
const connectDB = require("./src/config/db");
const user_actions = require("./src/actions/user");
const admin_actions = require("./src/actions/admin");

(async () => {
  // Connect mongodb
  await connectDB();

  // Check stats status
  let stats = await Stats.findOne();

  if (!stats) {
    stats = new Stats();
    await stats.save();
  }

  // Message Listener
  bot.on("message", async ({ from, text: message, chat, contact }) => {
    const chat_id = chat.id;

    let user = await User.findOne({ chat_id });

    if (!user) {
      const stats = await Stats.findOne();

      stats.users += 1;
      await stats.save();

      const newUser = new User({ ...from, chat_id, language_code: null });
      user = await newUser.save();
    }

    const isAdmin = admins[chat_id];
    const options = { chat, user, from, contact, text: message };

    if (isAdmin) admin_actions(options);
    else user_actions(options);
  });
})();
