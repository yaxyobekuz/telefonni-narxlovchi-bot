// Bot
const bot = require("./bot");

// Texts
const texts = require("./texts");

// Keyboards
const keyboards = require("./keyboards");

// Env
const { security_token } = require("../env.config");

// Hooks
const use_calculate = require("./hooks/use_calculate");

// DataBase
const { users, languages, mandatory_channels, statistics } = require("./db");

const format_message = (title, description) => `*${title}*\n\n${description}`;
const extract_numbers = (text = "") => text?.match(/-?\d+/g)?.map(Number) || [];

const send_message = (chat_id, text, options) => {
  try {
    bot.sendMessage(chat_id, text, { parse_mode: "Markdown", ...options });
  } catch {
    console.log("Xabarni yuborib bo'lmadi! Foydalanuvchi: " + chat_id);
  }
};

const check_user_membership = async (user_id) => {
  for (const channel of mandatory_channels) {
    try {
      const status = await bot.getChatMember(channel.chat_id, user_id);

      if (check_command("left", status?.status)) {
        return false;
      }
    } catch {
      return true;
    }
  }

  return true;
};

const update_click_stats = (key = "iphone") => {
  statistics.clicks[key] = statistics.clicks[key] + 1;
};

const isNumber = (value) => Number.isFinite(value);

const send_membership_message = (chat_id, language) => {
  send_message(chat_id, texts.membership_required[language], {
    reply_markup: {
      inline_keyboard: keyboards.user.mandatory_channels(language),
    },
  });
};

const check_command = (command_1, command_2) => {
  if (typeof command_1 !== "string" || typeof command_2 !== "string") {
    return false;
  }

  return command_1.trim().toLowerCase() === command_2.trim().toLowerCase();
};

const send_request_contact_message = (user_id, language) => {
  send_message(user_id, texts.request_contact[language], {
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.request_contact(language),
    },
  });

  users[user_id].state.name = "awaiting_contact";
};

const update_user_language = (user_id, language) => {
  const new_language = languages.find(({ name }) => name === language);

  if (!new_language) {
    return send_message(
      user_id,
      format_message(
        "Xatolik/Ошибка ❌",
        "Til to'g'ri tanlanmadi! Quyidagi tugmalar orqali tilni qaytadan tanlab ko'ring.\n\nЯзык выбран неправильно! Попробуйте выбрать язык еще раз с помощью кнопок ниже. 👇"
      ),
      {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.languages,
        },
      }
    );
  }

  users[user_id].language_code = new_language.value; // Update user language

  if (!users[user_id]?.contact) {
    return send_request_contact_message(user_id, new_language.value);
  }

  send_message(
    user_id,
    format_message(
      `${texts.success[new_language.value]} ✅`,
      texts.language_selection_success(new_language.name)[new_language.value]
    ),
    {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.home(new_language.value),
      },
    }
  );

  users[user_id].state.name = null;
};

const send_language_selection_message = (user_id) => {
  send_message(
    user_id,
    "Iltimos tilni tanlang!\n\nПожалуйста, выберите язык! 👇",
    {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.languages,
      },
    }
  );

  users[user_id].state.name = "language_selection";
};

const send_phone_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;
  update_click_stats();

  const {
    id: chat_id,
    language_code,
    state: {
      data: {
        cable,
        box_docs,
        device: {
          deductions: {
            countries,
            accessories: { box: box_minus },
          },
        },
        model: { name: model_name },
        country: { name: country_name },
        memory: { name: memory_name, price: initial_price },
        screen: { name: screen_name, percent: screen_percent },
        battery_capacity: { name: battery_name, percent: battery_percent },
      },
    },
  } = user;

  const { calculate_percentage } = use_calculate(initial_price);

  // Pricing
  const screen_price = calculate_percentage(screen_percent);
  const battery_price = calculate_percentage(battery_percent);
  const box_docs_price = check_command(t("yes"), box_docs) ? 0 : box_minus;
  const country_price = check_command(countries[0].name, country_name) ? 0 : 50;

  // Calculate minus
  const minus = screen_price + battery_price + country_price + box_docs_price;

  const pricing_amount_message =
    initial_price - minus > 0
      ? `${(initial_price - minus)?.toFixed(1)}$`
      : t("free");

  // Message texts
  const message_text = `
📱<b>${t("device")}</b>: ${model_name}
🧠<b>${t("memory")}</b>: ${memory_name}
📺<b>${t("screen")}</b>: ${screen_name}
🔋<b>${t("battery")}</b>: ${battery_name}
🌎<b>${t("country")}</b>: ${country_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/macbrouz">Telegram</a> | <a href="https://instagram.com/macbro.uz">Instagram</a>`;

  const share_text = `

📱**${t("device")}**: ${model_name}
🧠**${t("memory")}**: ${memory_name}
📺**${t("screen")}**: ${screen_name}
🔋**${t("battery")}**: ${battery_name}
🌎**${t("country")}**: ${country_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  // Send message
  send_message(chat_id, message_text, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), {
    parse_mode: "HTML",
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.home(language_code),
    },
  });

  // Clear user state
  update_state_name();
};

const send_ipad_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;
  update_click_stats("ipad");

  const {
    id: chat_id,
    language_code,
    state: {
      data: {
        box_docs,
        device: {
          deductions: {
            accessories: { box: box_minus },
          },
        },
        model: { name: model_name },
        memory: { name: memory_name, price: initial_price },
        appearance: { name: appearance_name, price: appearance_price },
        battery_capacity: { name: battery_name, percent: battery_percent },
      },
    },
  } = user;

  const { calculate_percentage } = use_calculate(initial_price);

  // Pricing
  const battery_price = calculate_percentage(battery_percent);
  const box_docs_price = check_command(t("yes"), box_docs) ? 0 : box_minus;

  // Calculate minus
  const minus = battery_price + box_docs_price + appearance_price;

  const pricing_amount_message =
    initial_price - minus > 0
      ? `${(initial_price - minus)?.toFixed(1)}$`
      : t("free");

  // Message texts
  const message_text = `
📱<b>${t("device")}</b>: ${model_name}
🧠<b>${t("memory")}</b>: ${memory_name}
✨<b>${t("appearance")}</b>: ${appearance_name}
🔋<b>${t("battery")}</b>: ${battery_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/macbrouz">Telegram</a> | <a href="https://instagram.com/macbro.uz">Instagram</a>`;

  const share_text = `

📱**${t("device")}**: ${model_name}
🧠**${t("memory")}**: ${memory_name}
✨**${t("appearance")}**: ${appearance_name}
🔋**${t("battery")}**: ${battery_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  // Send message
  send_message(chat_id, message_text, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), {
    parse_mode: "HTML",
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.home(language_code),
    },
  });

  // Clear user state
  update_state_name();
};

const send_macbook_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;
  update_click_stats("macbook");

  const {
    id: chat_id,
    language_code,
    state: {
      data: {
        box_docs,
        device: {
          deductions: {
            accessories: { box: box_minus },
          },
        },
        model: { name: model_name },
        screen: { name: screen_name, price: screen_price },
        memory: { name: memory_name, price: initial_price },
        battery_capacity: { name: battery_name, percent: battery_percent },
      },
    },
  } = user;

  const { calculate_percentage } = use_calculate(initial_price);

  // Pricing
  const battery_price = calculate_percentage(battery_percent);
  const box_docs_price = check_command(t("yes"), box_docs) ? 0 : box_minus;

  // Calculate minus
  const minus = screen_price + battery_price + box_docs_price;

  const pricing_amount_message =
    initial_price - minus > 0
      ? `${(initial_price - minus)?.toFixed(1)}$`
      : t("free");

  // Message texts
  const message_text = `
💻<b>${t("device")}</b>: ${model_name}
🧠<b>${t("memory")}</b>: ${memory_name}
📺<b>${t("screen")}</b>: ${screen_name}
🔋<b>${t("battery")}</b>: ${battery_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/macbrouz">Telegram</a> | <a href="https://instagram.com/macbro.uz">Instagram</a>`;

  const share_text = `

💻**${t("device")}**: ${model_name}
🧠**${t("memory")}**: ${memory_name}
📺**${t("screen")}**: ${screen_name}
🔋**${t("battery")}**: ${battery_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  // Send message
  send_message(chat_id, message_text, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), {
    parse_mode: "HTML",
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.home(language_code),
    },
  });

  // Clear user state
  update_state_name();
};

const send_iwatch_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;
  update_click_stats("iwatch");

  const {
    id: chat_id,
    language_code,
    state: {
      data: {
        strap,
        charger,
        box_docs,
        device: {
          deductions: {
            accessories: {
              box: box_minus,
              strap: strap_minus,
              charger: charger_minus,
            },
          },
        },
        model: { name: model_name },
        size: { name: size_name, price: initial_price },
        battery_capacity: { name: battery_name, percent: battery_percent },
      },
    },
  } = user;

  const { calculate_percentage } = use_calculate(initial_price);

  // Pricing
  const battery_price = calculate_percentage(battery_percent);
  const strap_price = check_command(t("yes"), strap) ? 0 : strap_minus;
  const box_docs_price = check_command(t("yes"), box_docs) ? 0 : box_minus;
  const charger_price = check_command(t("yes"), charger) ? 0 : charger_minus;

  // Calculate minus
  const minus = battery_price + box_docs_price + strap_price + charger_price;

  const pricing_amount_message =
    initial_price - minus > 0
      ? `${(initial_price - minus)?.toFixed(1)}$`
      : t("free");

  // Message texts
  const message_text = `
⌚️<b>${t("device")}</b>: ${model_name}
📏<b>${t("size")}</b>: ${size_name}
⚡️<b>${t("charger")}</b>: ${charger}
⛓️<b>${t("strap")}</b>: ${strap}
🔋<b>${t("battery")}</b>: ${battery_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/macbrouz">Telegram</a> | <a href="https://instagram.com/macbro.uz">Instagram</a>`;

  const share_text = `

⌚️**${t("device")}**: ${model_name}
📏**${t("size")}**: ${size_name}
⚡️**${t("charger")}**: ${charger}
⛓️**${t("strap")}**: ${strap}
🔋**${t("battery")}**: ${battery_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  // Send message
  send_message(chat_id, message_text, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), {
    parse_mode: "HTML",
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.home(language_code),
    },
  });

  // Clear user state
  update_state_name();
};

const send_airpods_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;
  update_click_stats("airpods");

  const {
    id: chat_id,
    language_code,
    state: {
      data: {
        box_docs,
        device: {
          deductions: {
            accessories: { box: box_minus },
          },
        },
        model: { name: model_name, price: initial_price },
        status: { name: status_name, percent: status_percent },
      },
    },
  } = user;

  const { calculate_percentage } = use_calculate(initial_price);

  // Pricing
  const status_price = calculate_percentage(status_percent);
  const box_docs_price = check_command(t("yes"), box_docs) ? 0 : box_minus;

  // Calculate minus
  const minus = box_docs_price + status_price;

  const pricing_amount_message =
    initial_price - minus > 0
      ? `${(initial_price - minus)?.toFixed(1)}$`
      : t("free");

  // Message texts
  const message_text = `
🎧<b>${t("device")}</b>: ${model_name}
🛠<b>${t("condition")}</b>: ${status_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/macbrouz">Telegram</a> | <a href="https://instagram.com/macbro.uz">Instagram</a>`;

  const share_text = `

🎧**${t("device")}**: ${model_name}
🛠**${t("condition")}**: ${status_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  // Send message
  send_message(chat_id, message_text, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), {
    parse_mode: "HTML",
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.home(language_code),
    },
  });

  // Clear user state
  update_state_name();
};

const check_auth = (req, res, next) => {
  const auth_code = req.query.auth;

  if (auth_code !== security_token) {
    return res.status(401).json({ error: "Noto'g'ri auth kodi" });
  }
  next();
};

module.exports = {
  isNumber,
  check_auth,
  send_message,
  check_command,
  format_message,
  extract_numbers,
  update_user_language,
  check_user_membership,
  send_membership_message,
  send_ipad_pricing_message,
  send_phone_pricing_message,
  send_iwatch_pricing_message,
  send_macbook_pricing_message,
  send_request_contact_message,
  send_airpods_pricing_message,
  send_language_selection_message,
};
