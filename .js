const {
  create_user,
  send_message,
  check_command,
  extract_numbers,
  check_user_state,
  update_user_state,
  update_user_language,
  send_pricing_message,
  update_user_state_data,
  send_request_contact_message,
  send_language_selection_message,
  check_user_membership,
  send_membership_message,
} = require("./src/utils");
const bot = require("./src/bot");
const texts = require("./src/texts");
const keyboards = require("./src/keyboards");
const { users, devices, mandatory_channels } = require("./src/db");

// Message listeners
bot.on("message", async ({ from: user, text: message, chat, contact }) => {
  const chat_id = chat.id;
  const user_storage = users[chat_id];
  const user_state = user_storage?.state;
  const user_language = user_storage?.language;
  const user_state_data = user_storage?.state_data;
  const is_command_back = check_command(texts.back, message);
  const is_awaiting_contact = check_user_state(chat_id, "awaiting_contact");

  // Start command
  if (
    !is_awaiting_contact &&
    (check_command("/start", message) || !user_storage)
  ) {
    if (!user_storage) {
      return create_user(user);
    }

    if (user_language) {
      if (!user_storage?.contact) {
        return send_request_contact_message(chat_id, user_language);
      }

      send_message(chat_id, texts.greeting[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.home(user_language),
        },
      });

      user_storage.state_data = {}; // Clear user state data
      return update_user_state(chat_id); // Clear user state
    }
  }

  // Update language
  if (check_user_state(chat_id, "language_selection")) {
    return update_user_language(chat_id, message);
  }

  // Send language selection message
  if (
    !user_state &&
    ((user_storage && !user_language) ||
      check_command(texts.change_language, message))
  ) {
    return send_language_selection_message(chat_id);
  }

  // Process contact message
  if (is_awaiting_contact) {
    if (!contact || contact.user_id !== chat_id) {
      return send_message(chat_id, texts.invalid_contact[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: [
            [
              {
                request_contact: true,
                text: texts.send_contact[user_language],
              },
            ],
          ],
        },
      });
    }

    user_storage.contact = contact.phone_number; // Update user contact

    send_message(chat_id, texts.registration_successful[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.home(user_language),
      },
    });

    return update_user_state(chat_id);
  }

  // Mandatory membership
  const is_member = await check_user_membership(chat_id);

  if (!is_member) return send_membership_message(chat_id, user_language);
});
