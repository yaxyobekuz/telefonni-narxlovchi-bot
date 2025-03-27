const {
  create_user,
  send_message,
  check_command,
  extract_numbers,
  check_user_state,
  update_user_state,
  update_user_language,
  send_pricing_message,
  check_user_membership,
  update_user_state_data,
  send_membership_message,
  send_request_contact_message,
  send_language_selection_message,
} = require("./src/utils");
const bot = require("./src/bot");
const texts = require("./src/texts");
const keyboards = require("./src/keyboards");
const { users, devices } = require("./src/db");

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

  // Help
  if (check_command(texts.help, message) && !user_state) {
    return send_message(chat_id, texts.contact[user_language]);
  }

  // Mandatory membership
  const is_member = await check_user_membership(chat_id);
  if (!is_member) return send_membership_message(chat_id, user_language);

  // Back
  if (is_command_back && user_state) {
    const step = extract_numbers(String(user_state))[0] - 2;

    if (step < 0) {
      send_message(chat_id, texts.cancel[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.home(user_language),
        },
      });

      user_storage.state_data = {}; // Clear state data
      return update_user_state(chat_id); // Clear user state
    }

    update_user_state(chat_id, `pricing_step_${step}`);
  }

  // Step 0 (Pricing)
  if (
    check_command(texts.pricing, message) ||
    check_user_state(chat_id, "pricing_step_0")
  ) {
    send_message(chat_id, texts.step_0[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_0(user_language),
      },
    });

    return update_user_state(chat_id, "pricing_step_1");
  }

  // Step 1 (Device)
  if (check_user_state(chat_id, "pricing_step_1")) {
    const device = Object.keys(devices).find(
      (device) => devices[device].name === message
    );

    if (!device && !is_command_back) {
      return send_message(chat_id, texts.invalid_device[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_0(user_language),
        },
      });
    }

    if (is_command_back) {
      send_message(chat_id, texts.step_1[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_1(
            user_language,
            user_state_data.device
          ),
        },
      });

      return update_user_state(chat_id, "pricing_step_2");
    }

    send_message(chat_id, texts.step_1[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_1(user_language, device),
      },
    });

    update_user_state_data(chat_id, "device", device);
    return update_user_state(chat_id, "pricing_step_2");
  }

  // Step 2 (Model)
  if (check_user_state(chat_id, "pricing_step_2")) {
    const device = user_state_data.device;
    const models = devices[device].models;
    const model = models.find((model) => model.name === message);
    const model_battery_levels = model?.battery_levels;

    if (!model && !is_command_back) {
      return send_message(chat_id, texts.invalid_model[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_1(user_language, device),
        },
      });
    }

    if (is_command_back) {
      send_message(chat_id, texts.step_2[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_2(
            user_language,
            user_state_data.model.battery_levels
          ),
        },
      });

      return update_user_state(chat_id, "pricing_step_3");
    }

    send_message(chat_id, texts.step_2[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_2(user_language, model_battery_levels),
      },
    });

    update_user_state_data(chat_id, "model", model);
    return update_user_state(chat_id, "pricing_step_3");
  }

  // Step 3 (Battery Level)
  if (check_user_state(chat_id, "pricing_step_3")) {
    const model = user_state_data.model;
    const battery_level = model.battery_levels.find(
      (battery_level) => battery_level.name === message
    );

    if (!battery_level && !is_command_back) {
      return send_message(chat_id, texts.invalid_battery_level[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_2(user_language, model.battery_levels),
        },
      });
    }

    if (!is_command_back) {
      update_user_state_data(chat_id, "battery_level", battery_level);
    }

    send_message(chat_id, texts.step_3[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_3(user_language),
      },
    });

    return update_user_state(chat_id, "pricing_step_4");
  }

  // Step 4 (Box & Document)
  if (check_user_state(chat_id, "pricing_step_4")) {
    const model = user_state_data.model;

    if (
      !is_command_back &&
      !check_command(texts.no, message) &&
      !check_command(texts.yes, message)
    ) {
      return send_message(chat_id, texts.invalid_box_and_doc[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_3(user_language),
        },
      });
    }

    if (is_command_back) {
      send_message(chat_id, texts.step_4[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_4(
            user_language,
            user_state_data.model.colors
          ),
        },
      });

      return update_user_state(chat_id, "pricing_step_5");
    }

    send_message(chat_id, texts.step_4[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_4(user_language, model.colors),
      },
    });

    update_user_state_data(
      chat_id,
      "box_and_doc",
      check_command(texts.yes, message)
    );
    return update_user_state(chat_id, "pricing_step_5");
  }

  // Step 5 (Color)
  if (check_user_state(chat_id, "pricing_step_5")) {
    const model = user_state_data.model;
    const color = model.colors.find((color) => color.name === message);

    if (!color && !is_command_back) {
      return send_message(chat_id, texts.invalid_color[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_4(user_language, model.colors),
        },
      });
    }

    if (is_command_back) {
      send_message(chat_id, texts.step_5[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_5(
            user_language,
            user_state_data.model.storages
          ),
        },
      });

      return update_user_state(chat_id, "pricing_step_6");
    }

    send_message(chat_id, texts.step_5[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_5(user_language, model.storages),
      },
    });

    update_user_state_data(chat_id, "color", color);
    return update_user_state(chat_id, "pricing_step_6");
  }

  // Step 6 (Storage)
  if (check_user_state(chat_id, "pricing_step_6")) {
    const model = user_state_data.model;
    const storage = model.storages.find((storage) => storage.name === message);

    if (!storage && !is_command_back) {
      return send_message(chat_id, texts.invalid_storage[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_5(user_language, model.storages),
        },
      });
    }

    if (is_command_back) {
      send_message(chat_id, texts.step_6[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_6(
            user_language,
            user_state_data.model.countries
          ),
        },
      });

      return update_user_state(chat_id, "pricing_step_7");
    }

    send_message(chat_id, texts.step_6[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_6(user_language, model.countries),
      },
    });

    update_user_state_data(chat_id, "storage", storage);
    return update_user_state(chat_id, "pricing_step_7");
  }

  // Step 7 (Country)
  if (check_user_state(chat_id, "pricing_step_7")) {
    const model = user_state_data.model;
    const country = model.countries.find((country) => country.name === message);

    if (!country && !is_command_back) {
      return send_message(chat_id, texts.invalid_country[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_6(user_language, model.countries),
        },
      });
    }

    if (is_command_back) {
      send_message(chat_id, texts.step_7[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_7(
            user_language,
            user_state_data.model.countries
          ),
        },
      });

      return update_user_state(chat_id, "pricing_step_8");
    }

    send_message(chat_id, texts.step_7[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_7(user_language, model.countries),
      },
    });

    update_user_state_data(chat_id, "country", country);
    return update_user_state(chat_id, "pricing_step_8");
  }

  // Step 8 (Damaged)
  if (check_user_state(chat_id, "pricing_step_8")) {
    const model = user_state_data.model;

    if (
      !is_command_back &&
      !check_command(texts.no, message) &&
      !check_command(texts.yes, message)
    ) {
      return send_message(chat_id, texts.invalid_damaged[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_7(user_language, model.countries),
        },
      });
    }

    if (check_command(texts.no, message) && !is_command_back) {
      update_user_state(chat_id);
      update_user_state_data(chat_id, "damaged", false);
      return send_pricing_message(user_storage);
    }

    if (is_command_back) {
      send_message(chat_id, texts.step_8[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_8(user_language),
        },
      });

      return update_user_state(chat_id, "pricing_step_9");
    }

    send_message(chat_id, texts.step_8[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_8(user_language),
      },
    });

    return update_user_state(chat_id, "pricing_step_9");
  }

  // Step 9 (Damaged in percentages)
  if (check_user_state(chat_id, "pricing_step_9")) {
    if (
      !is_command_back &&
      message !== "0-15%" &&
      message !== "15-30%" &&
      message !== "30-50%"
    ) {
      return send_message(chat_id, texts.invalid_damaged[user_language], {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.step_8(user_language),
        },
      });
    }

    update_user_state(chat_id);
    update_user_state_data(chat_id, "damaged", message);
    send_pricing_message(user_storage);
  }
});
