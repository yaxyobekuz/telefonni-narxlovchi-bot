const {
  create_user,
  send_message,
  check_command,
  extract_numbers,
  check_user_state,
  get_user_language,
  update_user_state,
  update_user_language,
  update_user_state_data,
  send_language_selection_message,
  send_pricing_message,
} = require("./src/utils");
const bot = require("./src/bot");
const texts = require("./src/texts");
const keyboards = require("./src/keyboards");
const { users, devices } = require("./src/db");

// Message listeners
bot.on("message", async ({ from: user, text: message, chat }) => {
  const chat_id = chat.id;
  const user_storage = users[chat_id];
  const user_state = user_storage?.state;
  const user_language = user_storage?.language;
  const user_state_data = user_storage?.state_data;

  console.log("😎 ", user_storage);

  // Start command
  if (check_command("/start", message) || !user_storage) {
    if (!user_storage) {
      return create_user(user);
    }
  }

  // Update language
  if (check_user_state(chat_id, "language_selection")) {
    return update_user_language(chat_id, message);
  }

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

    update_user_state(chat_id, `step_${step - 1}`);
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

    if (!device) {
      return send_message(chat_id, texts.invalid_device[user_language]);
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

    if (!model) {
      return send_message(chat_id, texts.invalid_model[user_language]);
    }

    const model_battery_levels = model.battery_levels;

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

    if (!battery_level) {
      return send_message(chat_id, texts.invalid_battery_level[user_language]);
    }

    send_message(chat_id, texts.step_3[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_3(user_language),
      },
    });

    update_user_state_data(chat_id, "battery_level", battery_level);
    return update_user_state(chat_id, "pricing_step_4");
  }

  // Step 4 (Box & Document)
  if (check_user_state(chat_id, "pricing_step_4")) {
    const model = user_state_data.model;

    if (
      !check_command(texts.yes, message) &&
      !check_command(texts.no, message)
    ) {
      return send_message(chat_id, texts.invalid_box_and_doc[user_language]);
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

    if (!color) {
      return send_message(chat_id, texts.invalid_color[user_language]);
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

    if (!storage) {
      return send_message(chat_id, texts.invalid_storage[user_language]);
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

    if (!country) {
      return send_message(chat_id, texts.invalid_country[user_language]);
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
    if (
      !check_command(texts.yes, message) &&
      !check_command(texts.no, message)
    ) {
      return send_message(chat_id, texts.invalid_damaged[user_language]);
    }

    if (check_command(texts.no, message)) {
      update_user_state(chat_id);
      update_user_state_data(chat_id, "damaged", false);
      return send_pricing_message(user_storage);
    }

    send_message(chat_id, texts.step_8[user_language], {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.step_8(user_language),
      },
    });

    return update_user_state(chat_id, "pricing_step_9");
  }

  // Step 9 (Damaged 2)
  if (check_user_state(chat_id, "pricing_step_9")) {
    if (message !== "0-15%" && message !== "15-30%" && message !== "30-50%") {
      return send_message(chat_id, texts.invalid_damaged[user_language]);
    }

    update_user_state(chat_id);
    update_user_state_data(chat_id, "damaged", message);
    send_pricing_message(user_storage);
  }
});
