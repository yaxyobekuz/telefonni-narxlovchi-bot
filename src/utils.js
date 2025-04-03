const bot = require("./bot");
const texts = require("./texts");
const keyboards = require("./keyboards");
const { users, languages, mandatory_channels } = require("./db");
const use_calculate = require("./hooks/use_calculate");

const format_message = (title, description) => `*${title}*\n\n${description}`;
const extract_numbers = (text = "") => text?.match(/-?\d+/g)?.map(Number) || [];

const send_message = (chat_id, text, options) => {
  bot.sendMessage(chat_id, text, { ...options, parse_mode: "Markdown" });
};

const check_user_membership = async (user_id) => {
  for (const channel of mandatory_channels) {
    const status = await bot.getChatMember(channel.chat_id, user_id);
    if (!status || ["left", "kicked"].includes(status.status)) {
      return false;
    }
  }

  return true;
};

const send_membership_message = (chat_id, language) => {
  send_message(chat_id, texts.membership_required[language], {
    reply_markup: {
      inline_keyboard: keyboards.user.mandatory_channels(language),
    },
  });
};

const check_command = (command_1, command_2) => {
  return command_1.trim().toLowerCase() === command_2.trim().toLowerCase();
};

const send_request_contact_message = (user_id, language) => {
  send_message(user_id, texts.request_contact[language], {
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.request_contact(language),
    },
  });

  update_state_name(user_id, "awaiting_contact");
};

const update_user_language = (user_id, language) => {
  const languages_name = Object.keys(languages).map(
    (language) => languages[language].name
  );

  if (!languages_name.includes(language)) {
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

  const new_language = Object.keys(languages).find(
    (language2) => languages[language2].name === language
  );

  users[user_id].language = new_language; // Update user language

  if (!users[user_id]?.contact) {
    return send_request_contact_message(user_id, new_language);
  }

  send_message(
    user_id,
    format_message(
      `${texts.success[new_language]} ✅`,
      texts.language_selection_success(languages[new_language].name)[
        new_language
      ]
    ),
    {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.home(new_language),
      },
    }
  );

  update_state_name(user_id); // Clear user state
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

  update_state_name(user_id, "language_selection");
};

const create_user = ({ first_name, username, language_code, id }) => {
  const new_user = { id, username, first_name };

  if (languages[language_code]) {
    new_user.language = language_code;
    users[id] = new_user; // Create a new user
    return send_request_contact_message(id, language_code);
  }

  users[id] = new_user;
  send_language_selection_message(id);
};

const send_phone_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;

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
            accessories: { box: box_minus, cable: cable_minus },
          },
        },
        model: { name: model_name },
        country: { name: country_name },
        memory: { name: memory_name, price: initial_price },
        screen: { name: screen_name, percent: screen_percent },
        appearance: { name: appearance_name, percent: appearance_percent },
        battery_capacity: { name: battery_name, percent: battery_percent },
      },
    },
  } = user;

  const { calculate_percentage } = use_calculate(initial_price);

  // Pricing
  const screen_price = calculate_percentage(screen_percent);
  const battery_price = calculate_percentage(battery_percent);
  const appearance_price = calculate_percentage(appearance_percent);
  const cable_price = check_command(t("yes"), cable) ? 0 : cable_minus;
  const box_docs_price = check_command(t("yes"), box_docs) ? 0 : box_minus;
  const country_price = check_command(countries[0].name, country_name) ? 0 : 50;

  // Calculate minus
  const minus =
    cable_price +
    screen_price +
    battery_price +
    country_price +
    box_docs_price +
    appearance_price;

  const pricing_amount_message =
    initial_price - minus > 0 ? `${initial_price - minus}$` : t("free");

  // Message texts
  const message_text = `
📱 *${model_name}
🧠 ${memory_name}
✨ ${appearance_name}
📺 ${screen_name}
🔋 ${battery_name}
🌎 ${country_name}
📦 ${box_docs}
🔌 ${cable}
💰 ${pricing_amount_message}*

${t("subscribe_prompt")}

[Telegram](https://t.me) | [Instagram](https://instagram.com)`;

  const share_text = `

📱 **${model_name}
🧠 ${memory_name}
✨ ${appearance_name}
📺 ${screen_name}
🔋 ${battery_name}
🌎 ${country_name}
📦 ${box_docs}
🔌 ${cable}
💰 ${pricing_amount_message}**`;

  // Send message
  send_message(chat_id, message_text, {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
    disable_web_page_preview: true,
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), k("home"));

  // Clear user state
  update_state_name();
};

const send_ipad_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;

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
    initial_price - minus > 0 ? `${initial_price - minus}$` : t("free");

  // Message texts
  const message_text = `
📱 *${model_name}
🧠 ${memory_name}
✨ ${appearance_name}
🔋 ${battery_name}
📦 ${box_docs}
💰 ${pricing_amount_message}*

${t("subscribe_prompt")}

[Telegram](https://t.me) | [Instagram](https://instagram.com)`;

  const share_text = `

📱 **${model_name}
🧠 ${memory_name}
✨ ${appearance_name}
🔋 ${battery_name}
📦 ${box_docs}
💰 ${pricing_amount_message}**`;

  // Send message
  send_message(chat_id, message_text, {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
    disable_web_page_preview: true,
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), k("home"));

  // Clear user state
  update_state_name();
};

const send_macbook_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;

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
        adapter: { name: adapter_name, price: adapter_price },
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
  const minus =
    screen_price +
    adapter_price +
    battery_price +
    box_docs_price +
    appearance_price;

  const pricing_amount_message =
    initial_price - minus > 0 ? `${initial_price - minus}$` : t("free");

  // Message texts
  const message_text = `
💻 *${model_name}
🧠 ${memory_name}
✨ ${appearance_name}
📺 ${screen_name}
🔋 ${battery_name}
📦 ${box_docs}
🖲 ${adapter_name}
💰 ${pricing_amount_message}*

${t("subscribe_prompt")}

[Telegram](https://t.me) | [Instagram](https://instagram.com)`;

  const share_text = `

💻 **${model_name}
🧠 ${memory_name}
✨ ${appearance_name}
📺 ${screen_name}
🔋 ${battery_name}
📦 ${box_docs}
🖲 ${adapter_name}
💰 ${pricing_amount_message}**`;

  // Send message
  send_message(chat_id, message_text, {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
    disable_web_page_preview: true,
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), k("home"));

  // Clear user state
  update_state_name();
};

const send_iwatch_pricing_message = ({ k, t, user, update_state_name }) => {
  if (!user) return;

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
    initial_price - minus > 0 ? `${initial_price - minus}$` : t("free");

  // Message texts
  const message_text = `
⌚️ *${model_name}
📏 ${size_name}
🔋 ${battery_name}
📦 ${box_docs}
💰 ${pricing_amount_message}*

${t("subscribe_prompt")}

[Telegram](https://t.me) | [Instagram](https://instagram.com)`;

  const share_text = `

⌚️ **${model_name}
📏 ${size_name}
🔋 ${battery_name}
📦 ${box_docs}
💰 ${pricing_amount_message}**`;

  // Send message
  send_message(chat_id, message_text, {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language_code, share_text),
    },
    disable_web_page_preview: true,
  });

  // Back to Home
  send_message(chat_id, t("contact_admin"), k("home"));

  // Clear user state
  update_state_name();
};

module.exports = {
  create_user,
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
  send_language_selection_message,
};
