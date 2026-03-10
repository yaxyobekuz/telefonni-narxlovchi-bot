const bot = require("./src/bot");
const { admins } = require("./src/db");
const User = require("./src/models/User");
const Stats = require("./src/models/Stats");
const connectDB = require("./src/config/db");
const user_actions = require("./src/actions/user");
const admin_actions = require("./src/actions/admin");
const setDefaultDevices = require("./src/defaultDevices");

(async () => {
  // Connect mongodb
  await connectDB();

  // Check and set default devices
  await setDefaultDevices();

  // Check stats status
  let stats = await Stats.findOne();

  if (!stats) {
    stats = new Stats();
    await stats.save();
  }

  // Message Listener
  bot.on("message", async (raw_message) => {
    const { from, text: message, chat, contact } = raw_message;
    const chat_id = chat.id;

    let user = await User.findOne({ chat_id });

    if (!user) {
      const stats = await Stats.findOne();

      stats.users = (stats.users || 0) + 1;
      await stats.save();

      try {
        const newUser = new User({
          ...from,
          chat_id,
          language_code: null,
          username: from?.username || null,
        });
        user = await newUser.save();
      } catch {
        return;
      }
    }

    const isAdmin = admins[chat_id];
    const options = { chat, user, from, contact, text: message, raw_message };

    if (isAdmin) admin_actions(options);
    else user_actions(options);
  });
})();
