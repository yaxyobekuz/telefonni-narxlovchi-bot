// Bot
const bot = require("./bot");

// Texts
const texts = require("./texts");

// Schemas
const User = require("./models/User");
const Stats = require("./models/Stats");
const PricingEvent = require("./models/PricingEvent");

// Keyboards
const keyboards = require("./keyboards");

// Hooks
const use_calculate = require("./hooks/use_calculate");

// DataBase
const { languages, mandatory_channels } = require("./db");

const format_message = (title, description) => `*${title}*\n\n${description}`;
const extract_numbers = (text = "") => text?.match(/-?\d+/g)?.map(Number) || [];

const send_message = async (chat_id, text, options) => {
  try {
    await bot.sendMessage(chat_id, text, {
      parse_mode: "Markdown",
      ...options,
    });
  } catch (error) {
    const description =
      error?.response?.body?.description || error?.message || "Noma'lum xatolik";
    console.log(
      "Xabarni yuborib bo'lmadi! Foydalanuvchi:",
      chat_id,
      "Sabab:",
      description
    );
  }
};

const send_document = async (chat_id, document, options = {}) => {
  const {
    filename = "export.xlsx",
    contentType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ...telegram_options
  } = options;

  try {
    if (Buffer.isBuffer(document)) {
      await bot.sendDocument(chat_id, document, telegram_options, {
        filename,
        contentType,
      });
      return;
    }

    await bot.sendDocument(chat_id, document, telegram_options);
  } catch {
    console.log("Faylni yuborib bo'lmadi! Foydalanuvchi: " + chat_id);
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

const update_click_stats = async (key = "iphone") => {
  const statistics = await Stats.findOne();
  if (!statistics) return;
  statistics.clicks[key] = (statistics.clicks[key] || 0) + 1;
  await statistics.save();
};

const clone_data = (value) => {
  try {
    return JSON.parse(JSON.stringify(value || {}));
  } catch {
    return {};
  }
};

const ensure_user_quick_stats = (user) => {
  if (!user.quick_stats) {
    user.quick_stats = {};
  }

  if (!user.quick_stats.totals) {
    user.quick_stats.totals = {};
  }

  if (!user.quick_stats.totals.by_device) {
    user.quick_stats.totals.by_device = {};
  }

  for (const key of ["iphone", "ipad", "macbook", "iwatch", "airpods"]) {
    user.quick_stats.totals.by_device[key] =
      user.quick_stats.totals.by_device[key] || 0;
  }

  if (!user.quick_stats.top_models_by_device) {
    user.quick_stats.top_models_by_device = {};
  }

  if (!user.quick_stats.model_counts_by_device) {
    user.quick_stats.model_counts_by_device = {};
  }

  for (const key of ["iphone", "ipad", "macbook", "iwatch", "airpods"]) {
    if (!Array.isArray(user.quick_stats.top_models_by_device[key])) {
      user.quick_stats.top_models_by_device[key] = [];
    }

    if (
      !user.quick_stats.model_counts_by_device[key] ||
      typeof user.quick_stats.model_counts_by_device[key] !== "object"
    ) {
      user.quick_stats.model_counts_by_device[key] = {};
    }
  }
};

const build_top_models_from_counts = (model_counts) => {
  return Object.entries(model_counts)
    .map(([name, value]) => ({
      model_name: name,
      count: value?.count || 0,
      last_priced_at: value?.last_priced_at || null,
      last_final_price: value?.last_final_price || 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 3);
};

const persist_pricing_event = async ({
  user,
  device_type,
  model_name,
  pricing,
  message_text,
  share_text,
  device_snapshot,
}) => {
  const state_data_snapshot = clone_data(user?.state?.data);
  const user_snapshot = {
    chat_id: user?.chat_id || null,
    first_name: user?.first_name || null,
    username: user?.username || null,
    phone: user?.phone || null,
    language_code: user?.language_code || null,
    state_data: state_data_snapshot,
  };

  await PricingEvent.create({
    chat_id: user?.chat_id,
    user_id: user?._id,
    device_type,
    language_code: user?.language_code || null,
    user_snapshot,
    device_snapshot,
    state_name: user?.state?.name || null,
    state_data_snapshot,
    pricing,
    telegram_payload: {
      message_text,
      share_text,
    },
  });

  ensure_user_quick_stats(user);

  user.quick_stats.totals.all_pricings =
    (user.quick_stats.totals.all_pricings || 0) + 1;
  user.quick_stats.totals.by_device[device_type] =
    (user.quick_stats.totals.by_device[device_type] || 0) + 1;
  user.quick_stats.totals.last_priced_at = new Date();
  user.quick_stats.totals.last_device_type = device_type;

  const model_counts = user.quick_stats.model_counts_by_device[device_type];
  const existing_model_stats = model_counts[model_name] || { count: 0 };
  model_counts[model_name] = {
    count: (existing_model_stats.count || 0) + 1,
    last_priced_at: new Date(),
    last_final_price: pricing.final_price,
  };

  user.quick_stats.top_models_by_device[device_type] =
    build_top_models_from_counts(model_counts);

  user.markModified("quick_stats");
  await user.save();
};

const track_pricing_event = async (payload) => {
  try {
    await persist_pricing_event(payload);
  } catch (error) {
    console.error("Pricing analytics save error:", error?.message || error);
  }
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

const send_request_contact_message = async (chat_id, language) => {
  await User.findOneAndUpdate(
    { chat_id },
    { state: { name: "awaiting_contact" } },
  );

  send_message(chat_id, texts.request_contact[language], {
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user.request_contact(language),
    },
  });
};

const update_user_language = async (user_id, language) => {
  const new_language = languages.find(({ name }) => name === language);

  if (!new_language) {
    return send_message(
      user_id,
      format_message(
        "Xatolik/Ошибка ❌",
        "Til to'g'ri tanlanmadi! Quyidagi tugmalar orqali tilni qaytadan tanlab ko'ring.\n\nЯзык выбран неправильно! Попробуйте выбрать язык еще раз с помощью кнопок ниже. 👇",
      ),
      {
        reply_markup: {
          resize_keyboard: true,
          keyboard: keyboards.user.languages,
        },
      },
    );
  }

  // MongoDB orqali user tilini va state.name ni yangilaymiz
  const user = await User.findOneAndUpdate(
    { chat_id: user_id },
    {
      $set: {
        "state.name": null,
        language_code: new_language.value,
      },
    },
    { new: true }, // yangilangan hujjatni qaytaradi
  );

  // Agar user topilmasa
  if (!user) {
    return send_message(user_id, "Foydalanuvchi topilmadi! ❌");
  }

  // Agar contact hali mavjud bo'lmasa
  if (!user.phone) {
    return send_request_contact_message(user_id, new_language.value);
  }

  // Muvaffaqiyatli holatda til tanlandi
  send_message(
    user_id,
    format_message(
      `${texts.success[new_language.value]} ✅`,
      texts.language_selection_success(new_language.name)[new_language.value],
    ),
    {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.home(new_language.value),
      },
    },
  );
};

const send_language_selection_message = async (chat_id) => {
  await User.findOneAndUpdate(
    { chat_id },
    { state: { name: "language_selection" } },
  );

  send_message(
    chat_id,
    "Iltimos tilni tanlang!\n\nПожалуйста, выберите язык! 👇",
    {
      reply_markup: {
        resize_keyboard: true,
        keyboard: keyboards.user.languages,
      },
    },
  );
};

const send_phone_pricing_message = async ({ t, id }) => {
  const user = await User.findOne({ chat_id: id });

  update_click_stats();

  const {
    chat_id,
    language_code,
    state: {
      data: {
        box_docs,
        device: {
          deductions: {
            sims,
            accessories: { box: box_minus },
          },
        },
        sim: { name: sim_name },
        color: { name: color_name },
        model: { name: model_name },
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
  const sim_price = (() => {
    if (
      model_name?.toLowerCase()?.startsWith("iphone") &&
      extract_numbers(model_name)?.[0] < 14
    )
      return 0;

    return check_command(sims[0].name, sim_name) ? 50 : 0;
  })();

  // Calculate minus
  const minus = screen_price + battery_price + sim_price + box_docs_price;

  const pricing_amount_message =
    initial_price - minus > 0
      ? `${(initial_price - minus)?.toFixed(1)}$`
      : t("free");

  // Message texts
  const message_text = `
📱<b>${t("device")}</b>: ${model_name}
🧠<b>${t("memory")}</b>: ${memory_name}
📺<b>${t("screen")}</b>: ${screen_name}
🎨<b>${t("color")}</b>: ${color_name}
🔋<b>${t("battery")}</b>: ${battery_name}
🌎<b>${t("sim")}</b>: ${sim_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/+vBZKzC7p7rMzMmY6">Telegram</a> | <a href="https://www.instagram.com/smartlife_uz">Instagram</a>`;

  const share_text = `

📱**${t("device")}**: ${model_name}
🧠**${t("memory")}**: ${memory_name}
📺**${t("screen")}**: ${screen_name}
🎨**${t("color")}**: ${color_name}
🔋**${t("battery")}**: ${battery_name}
🌎**${t("sim")}**: ${sim_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  const final_price =
    initial_price - minus > 0 ? +(initial_price - minus).toFixed(1) : 0;

  await track_pricing_event({
    user,
    device_type: "iphone",
    model_name,
    pricing: {
      initial_price,
      minus,
      final_price,
      screen_deduction: screen_price,
      battery_deduction: battery_price,
      box_deduction: box_docs_price,
      sim_deduction: sim_price,
      appearance_deduction: 0,
      strap_deduction: 0,
      charger_deduction: 0,
      condition_deduction: 0,
    },
    message_text,
    share_text,
    device_snapshot: {
      device_name: "iPhone",
      model_name,
      memory_name,
      screen_name,
      color_name,
      battery_name,
      sim_name,
      box_docs,
    },
  });

  // Send message
  await send_message(chat_id, message_text, {
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
};

const send_ipad_pricing_message = async ({ t, id }) => {
  const user = await User.findOne({ chat_id: id });

  update_click_stats("ipad");

  const {
    chat_id,
    language_code,
    state: {
      data: {
        box_docs,
        device: {
          deductions: {
            accessories: { box: box_minus },
          },
        },
        color: { name: color_name },
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
🎨<b>${t("color")}</b>: ${color_name}
🔋<b>${t("battery")}</b>: ${battery_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/+vBZKzC7p7rMzMmY6">Telegram</a> | <a href="https://www.instagram.com/smartlife_uz">Instagram</a>`;

  const share_text = `

📱**${t("device")}**: ${model_name}
🧠**${t("memory")}**: ${memory_name}
✨**${t("appearance")}**: ${appearance_name}
🎨**${t("color")}**: ${color_name}
🔋**${t("battery")}**: ${battery_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  const final_price =
    initial_price - minus > 0 ? +(initial_price - minus).toFixed(1) : 0;

  await track_pricing_event({
    user,
    device_type: "ipad",
    model_name,
    pricing: {
      initial_price,
      minus,
      final_price,
      screen_deduction: 0,
      battery_deduction: battery_price,
      box_deduction: box_docs_price,
      sim_deduction: 0,
      appearance_deduction: appearance_price,
      strap_deduction: 0,
      charger_deduction: 0,
      condition_deduction: 0,
    },
    message_text,
    share_text,
    device_snapshot: {
      device_name: "iPad",
      model_name,
      memory_name,
      appearance_name,
      color_name,
      battery_name,
      box_docs,
    },
  });

  // Send message
  await send_message(chat_id, message_text, {
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
};

const send_macbook_pricing_message = async ({ t, id }) => {
  const user = await User.findOne({ chat_id: id });

  update_click_stats("macbook");

  const {
    chat_id,
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
        color: { name: color_name },
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
🎨<b>${t("color")}</b>: ${color_name}
📦<b>${t("box")}</b>: ${box_docs}
💰<b>${t("price")}</b>: ${pricing_amount_message}

${t("subscribe_prompt")}

<a href="https://t.me/+vBZKzC7p7rMzMmY6">Telegram</a> | <a href="https://www.instagram.com/smartlife_uz">Instagram</a>`;

  const share_text = `

💻**${t("device")}**: ${model_name}
🧠**${t("memory")}**: ${memory_name}
📺**${t("screen")}**: ${screen_name}
🔋**${t("battery")}**: ${battery_name}
🎨**${t("color")}**: ${color_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  const final_price =
    initial_price - minus > 0 ? +(initial_price - minus).toFixed(1) : 0;

  await track_pricing_event({
    user,
    device_type: "macbook",
    model_name,
    pricing: {
      initial_price,
      minus,
      final_price,
      screen_deduction: screen_price,
      battery_deduction: battery_price,
      box_deduction: box_docs_price,
      sim_deduction: 0,
      appearance_deduction: 0,
      strap_deduction: 0,
      charger_deduction: 0,
      condition_deduction: 0,
    },
    message_text,
    share_text,
    device_snapshot: {
      device_name: "MacBook",
      model_name,
      memory_name,
      screen_name,
      color_name,
      battery_name,
      box_docs,
    },
  });

  // Send message
  await send_message(chat_id, message_text, {
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
};

const send_iwatch_pricing_message = async ({ t, id }) => {
  const user = await User.findOne({ chat_id: id });

  update_click_stats("iwatch");

  const {
    chat_id,
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

<a href="https://t.me/+vBZKzC7p7rMzMmY6">Telegram</a> | <a href="https://www.instagram.com/smartlife_uz">Instagram</a>`;

  const share_text = `

⌚️**${t("device")}**: ${model_name}
📏**${t("size")}**: ${size_name}
⚡️**${t("charger")}**: ${charger}
⛓️**${t("strap")}**: ${strap}
🔋**${t("battery")}**: ${battery_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  const final_price =
    initial_price - minus > 0 ? +(initial_price - minus).toFixed(1) : 0;

  await track_pricing_event({
    user,
    device_type: "iwatch",
    model_name,
    pricing: {
      initial_price,
      minus,
      final_price,
      screen_deduction: 0,
      battery_deduction: battery_price,
      box_deduction: box_docs_price,
      sim_deduction: 0,
      appearance_deduction: 0,
      strap_deduction: strap_price,
      charger_deduction: charger_price,
      condition_deduction: 0,
    },
    message_text,
    share_text,
    device_snapshot: {
      device_name: "iWatch",
      model_name,
      size_name,
      strap,
      charger,
      battery_name,
      box_docs,
    },
  });

  // Send message
  await send_message(chat_id, message_text, {
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
};

const send_airpods_pricing_message = async ({ t, id }) => {
  const user = await User.findOne({ chat_id: id });

  update_click_stats("airpods");

  const {
    chat_id,
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

<a href="https://t.me/+vBZKzC7p7rMzMmY6">Telegram</a> | <a href="https://www.instagram.com/smartlife_uz">Instagram</a>`;

  const share_text = `

🎧**${t("device")}**: ${model_name}
🛠**${t("condition")}**: ${status_name}
📦**${t("box")}**: ${box_docs}
💰**${t("price")}**: ${pricing_amount_message}`;

  const final_price =
    initial_price - minus > 0 ? +(initial_price - minus).toFixed(1) : 0;

  await track_pricing_event({
    user,
    device_type: "airpods",
    model_name,
    pricing: {
      initial_price,
      minus,
      final_price,
      screen_deduction: 0,
      battery_deduction: 0,
      box_deduction: box_docs_price,
      sim_deduction: 0,
      appearance_deduction: 0,
      strap_deduction: 0,
      charger_deduction: 0,
      condition_deduction: status_price,
    },
    message_text,
    share_text,
    device_snapshot: {
      device_name: "AirPods",
      model_name,
      status_name,
      box_docs,
    },
  });

  // Send message
  await send_message(chat_id, message_text, {
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
};

module.exports = {
  isNumber,
  send_message,
  send_document,
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
