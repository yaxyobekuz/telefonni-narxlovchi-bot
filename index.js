const {
  create_user,
  send_message,
  check_command,
  extract_numbers,
  check_user_state,
  get_user_language,
  update_user_state,
  update_user_language,
  send_language_selection_message,
} = require("./src/utils");
const bot = require("./src/bot");
const texts = require("./src/texts");
const keyboards = require("./src/keyboards");
const { users, devices } = require("./src/db");

// Message listeners
bot.on("message", async ({ from: user, text: message, chat }) => {
  const chat_id = chat.id;

  // Start command
  if (check_command("/start", message)) {
    if (!users[chat_id]) {
      return create_user(user);
    }
  }

  // Update language
  if (check_user_state(chat_id, "language_selection")) {
    return update_user_language(chat_id, message);
  }

  // Get user from server
  const user_storage = users[chat_id];
  const user_state = user_storage?.state;
  const user_language = user_storage?.language;

  // Send language selection message
  if (
    (user_storage && !user_language) ||
    check_command(texts.change_language, message)
  ) {
    return send_language_selection_message(chat_id);
  }

  // Help
  if (check_command(texts.help, message)) {
    return send_message(chat_id, texts.contact[get_user_language(chat_id)]);
  }

  // Back
  if (check_command(texts.back, message) && user_state) {
    const step = Number(extract_numbers(String(user_state)));

    if (step === 0) {
      send_message(chat_id, texts.cancel[get_user_language(chat_id)], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.home(user_language),
        },
      });

      return update_user_state(chat_id); // Clear user state
    }

    update_user_state(chat_id, `pricing_step_${step - 1}`);
  }

  console.log("😎: ", user_state);

  // Pricing (Step 0)
  if (
    check_command(texts.pricing, message) ||
    check_user_state(chat_id, "pricing_step_0")
  ) {
    send_message(chat_id, texts.nailing[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_1(user_language),
      },
    });

    return update_user_state(chat_id, "pricing_step_1");
  }

  // Step 1 (For pricing)
  if (check_user_state(chat_id, "pricing_step_1")) {
    const device = Object.keys(devices).find(
      (device) => devices[device].name === message
    );

    if (!device) {
      return send_message(chat_id, texts.invalid_device[user_language]);
    }

    send_message(chat_id, texts.nailing[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_2(user_language, device),
      },
    });

    // return update_user_state(chat_id, "pricing_step_2");
  }
});
