const bot = require("./bot");
const texts = require("./texts");
const keyboards = require("./keyboards");
const { users, languages } = require("./db");

const extract_numbers = (text = "") => text?.replace(/\D/g, "");

const format_message = (title, description) => `*${title}*\n\n${description}`;

const send_message = (chatId, text, options) => {
  bot.sendMessage(chatId, text, { ...options, parse_mode: "Markdown" });
};

const check_command = (command_data, command_text) => {
  if (typeof command_data === "string" && command_data?.startsWith("/")) {
    return command_data === command_text;
  }

  return Object.values(command_data).includes(command_text);
};

const check_user_state = (user_id, state) => {
  if (!users[user_id]) {
    console.error(
      `Error: User with ID ${user_id} not found. Cannot check state.`
    );
    return false;
  }

  return users[user_id].state === state;
};

const get_user_language = (user_id) => {
  return users[user_id]?.language;
};

const update_user_state = (user_id, state) => {
  if (!users[user_id]) {
    return console.error(
      `Error: User with ID ${user_id} not found. Unable to update state.`
    );
  }

  users[user_id].state = state;
};

const update_user_state_data = (user_id, key = "", data) => {
  const user = users[user_id];

  if (!user) {
    return console.error(
      `Error: User with ID ${user_id} not found. Unable to update state data.`
    );
  }

  if (!user.state_data) {
    user.state_data = {};
  }

  user.state_data[key] = data;
};

const get_user_state_data = (user_id) => {
  const user = users[user_id];

  if (!user) {
    return console.error(`Error: User with ID ${user_id} not found.`);
  }

  return user.state_data || {};
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
      )
    );
  }

  const new_language = Object.keys(languages).find(
    (language2) => languages[language2].name === language
  );

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

  update_user_state(user_id); // Clear user state
  users[user_id].language = new_language; // Update user language
};

const send_language_selection_message = (user_id) => {
  const formatted_languages = Object.keys(languages).map((lang) => {
    return { text: languages[lang].name };
  });

  send_message(
    user_id,
    "Iltimos tilni tanlang!\n\nПожалуйста, выберите язык! 👇",
    {
      reply_markup: {
        keyboard: [
          [formatted_languages[0], formatted_languages[1]],
          [formatted_languages[2]],
        ],
        resize_keyboard: true,
      },
    }
  );

  update_user_state(user_id, "language_selection");
};

const create_user = ({ first_name, username, language_code, id }) => {
  const new_user = { id, username, first_name };

  if (languages[language_code]) {
    return (new_user.language = language_code);
  }

  users[id] = new_user;
  send_language_selection_message(id);
};

const send_pricing_message = (user) => {
  const chat_id = user.id;
  const language = user.language;
  const state_data = user.state_data;
  const model = state_data.model;

  // Details
  const price = model.price;
  const model_name = model.name;
  const damaged = state_data.damaged;
  const color_name = state_data.color.name;
  const color_minus = state_data.color.minus;
  const box_and_doc = state_data.box_and_doc;
  const storage_name = state_data.storage.name;
  const country_name = state_data.country.name;
  const country_minus = state_data.country.minus;
  const storage_minus = state_data.storage.minus;
  const battery_level_name = state_data.battery_level.name;
  const battery_level_minus = state_data.battery_level.minus;
  const damaged_minus = damaged ? model.damaged[damaged] : 0;

  // Calculate price
  const box_and_doc_minus = box_and_doc ? model.box_and_doc : 0;
  const minus =
    color_minus +
    damaged_minus +
    storage_minus +
    country_minus +
    box_and_doc_minus +
    battery_level_minus;

  // Message text
  const message_text = `
📱 *${model_name}
🧠 ${storage_name}
💥 ${damaged ? damaged : "0%"} 
🔋 ${battery_level_name}
🌎 ${country_name}
🎨 ${color_name}
📦 ${box_and_doc ? texts.yes[language] : texts.no[language]}
💰 ${price - minus}$*

${texts.subscribe_prompt[language]}

[Telegram](https://t.me) | [Instagram](https://instagram.com)`;

  const share_text = `

📱 **${model_name}
🧠 ${storage_name}
💥 ${damaged ? damaged : "0%"} 
🔋 ${battery_level_name}
🌎 ${country_name}
🎨 ${color_name}
📦 ${box_and_doc ? texts.yes[language] : texts.no[language]}
💰 ${price - minus}$**`;

  send_message(chat_id, message_text, {
    reply_markup: {
      resize_keyboard: true,
      inline_keyboard: keyboards.user.share(language, share_text),
    },
    disable_web_page_preview: true,
  });

  send_message(chat_id, texts.contact_admin[language], {
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.home(language),
    },
  });

  user.state_data = {};
};

module.exports = {
  create_user,
  send_message,
  check_command,
  format_message,
  extract_numbers,
  check_user_state,
  update_user_state,
  get_user_language,
  get_user_state_data,
  update_user_language,
  send_pricing_message,
  update_user_state_data,
  send_language_selection_message,
};
