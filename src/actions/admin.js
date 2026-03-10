// Texts
const texts = require("../texts");
const bot = require("../bot");

// Keyboards
const keyboards = require("../keyboards");

// DataBase
const Stats = require("../models/Stats");
const Device = require("../models/Device");
const User = require("../models/User");
const PricingEvent = require("../models/PricingEvent");

// Hooks
const use_user_state = require("../hooks/use_user_state");
const {
  build_pricing_events_excel_buffer,
  build_users_excel_buffer,
} = require("../hooks/use_excel_export");

// Utils
const {
  send_message,
  send_document,
  check_command,
  isNumber,
} = require("../utils");

const EXPORT_COOLDOWN_BY_ACTION = {
  users_export: 5 * 60 * 1000,
  events_export: 60 * 1000,
};
const export_limiter = new Map();
const BROADCAST_SLEEP_MS = 200;
const broadcast_lock = {
  in_progress: false,
  started_by: null,
  started_at: null,
  total_users: 0,
};

const get_limiter_key = (admin_chat_id, action_name) =>
  `${admin_chat_id}:${action_name}`;

const get_remaining_cooldown = (admin_chat_id, action_name) => {
  const key = get_limiter_key(admin_chat_id, action_name);
  const previous_ts = export_limiter.get(key);
  const cooldown_ms = EXPORT_COOLDOWN_BY_ACTION[action_name] || 0;

  if (!previous_ts || cooldown_ms <= 0) return 0;

  const now = Date.now();
  const remaining = cooldown_ms - (now - previous_ts);
  return remaining > 0 ? remaining : 0;
};

const mark_export_used = (admin_chat_id, action_name) => {
  export_limiter.set(get_limiter_key(admin_chat_id, action_name), Date.now());
};

const file_name_timestamp = () => {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .slice(0, 15);
};

const normalize_phone_digits = (value = "") => String(value).replace(/\D/g, "");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const is_forwarded_message = (raw_message = {}) => {
  return Boolean(
    raw_message?.forward_from ||
      raw_message?.forward_from_chat ||
      raw_message?.forward_origin ||
      raw_message?.forward_date,
  );
};

const admin_actions = async ({
  user,
  text: message,
  chat: { id: chat_id },
  raw_message,
}) => {
  const user_state = user?.state;
  const t = (text) => texts[text]["uz"];
  const k = (keyboard_name, data) => ({
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.admin[keyboard_name](data),
    },
  });

  const {
    get_state_data,
    clear_state_data,
    check_state_name,
    update_state_data,
    update_state_name,
  } = use_user_state(user);

  const state_data = get_state_data();

  const clearState = async () => {
    clear_state_data();
    update_state_name(null);
    return await user.save();
  };

  if (check_state_name("broadcast_sending")) {
    return send_message(chat_id, t("broadcast_in_progress"), k("home"));
  }

  if (check_command("/start", message)) {
    // Clear user state name
    if (user_state?.name) await clearState();

    // Send greeting message
    return send_message(chat_id, t("greeting"), k("home"));
  }

  // Help
  if (check_command(t("home"), message)) {
    await clearState();
    return send_message(chat_id, t("cancel"), k("home"));
  }

  // Statistics
  if (check_command(t("statistics"), message)) {
    const statistics = await Stats.findOne();
    let click_stats = "";
    Object.keys(statistics.clicks).forEach((name) => {
      click_stats += "\n";
      click_stats += `*${name}:* ${statistics.clicks[name]?.toLocaleString()}`;
    });

    return send_message(
      chat_id,
      `*${t(
        "statistics",
      )}*\n\n*💸 Narxlash bo'yicha:*\n${click_stats}\n\n*👥 Jami foydalanuvchilar:* ${statistics.users?.toLocaleString()}\n\n*📞 Ro'yxatdan o'tgan foydalanuvchilar:* ${statistics.registered_users?.toLocaleString()}`,
      k("home"),
    );
  }

  if (check_command(t("broadcast_send"), message)) {
    if (broadcast_lock.in_progress) {
      return send_message(chat_id, t("broadcast_busy"), k("home"));
    }

    if (user_state?.name) {
      await clearState();
    }

    update_state_name("broadcast_wait_forward");
    await user.save();
    return send_message(chat_id, t("broadcast_enter_forward"), k("back_to_home"));
  }

  if (check_state_name("broadcast_wait_forward")) {
    if (broadcast_lock.in_progress) {
      return send_message(chat_id, t("broadcast_busy"), k("home"));
    }

    const is_forward = is_forwarded_message(raw_message);
    const source_chat_id = raw_message?.chat?.id;
    const source_message_id = raw_message?.message_id;

    if (
      !is_forward ||
      !Number.isInteger(source_chat_id) ||
      !Number.isInteger(source_message_id)
    ) {
      return send_message(chat_id, t("broadcast_invalid_forward"), k("back_to_home"));
    }

    update_state_name("broadcast_sending");
    await user.save();

    const started_at = Date.now();
    let total = 0;
    let success = 0;
    let error = 0;
    let skipped = 0;

    broadcast_lock.in_progress = true;
    broadcast_lock.started_by = chat_id;
    broadcast_lock.started_at = started_at;

    try {
      const users = await User.find({}, { chat_id: 1, _id: 0 }).lean();
      const chat_ids = [...new Set(users.map((item) => item?.chat_id))].filter(
        (id) => Number.isInteger(id),
      );

      total = chat_ids.length;
      broadcast_lock.total_users = total;

      await send_message(
        chat_id,
        `${t("broadcast_in_progress")}\n\n*Jami foydalanuvchilar:* ${total}`,
        k("home"),
      );

      for (let index = 0; index < chat_ids.length; index++) {
        const target_chat_id = chat_ids[index];

        if (!Number.isInteger(target_chat_id)) {
          skipped += 1;
          continue;
        }

        try {
          await bot.copyMessage(
            target_chat_id,
            source_chat_id,
            source_message_id,
          );
          success += 1;
        } catch (forward_error) {
          error += 1;
          const description =
            forward_error?.response?.body?.description ||
            forward_error?.message ||
            "Noma'lum xatolik";
          console.log(
            "Forward yuborilmadi. Foydalanuvchi:",
            target_chat_id,
            "Sabab:",
            description,
          );
        }

        if (index < chat_ids.length - 1) {
          await sleep(BROADCAST_SLEEP_MS);
        }
      }
    } catch (broadcast_error) {
      console.error("Broadcast process error:", broadcast_error?.message || broadcast_error);
    } finally {
      const duration_seconds = Math.ceil((Date.now() - started_at) / 1000);
      broadcast_lock.in_progress = false;
      broadcast_lock.started_by = null;
      broadcast_lock.started_at = null;
      broadcast_lock.total_users = 0;

      await clearState();

      await send_message(
        chat_id,
        `*${t("broadcast_complete")}*\n\n*Jami:* ${total}\n*Success:* ${success}\n*Error:* ${error}\n*Skipped:* ${skipped}\n*Davomiyligi:* ${duration_seconds} soniya`,
        k("home"),
      );
    }

    return;
  }

  if (check_command(t("export_users_excel"), message)) {
    if (user_state?.name) {
      await clearState();
    }

    const remaining = get_remaining_cooldown(chat_id, "users_export");
    if (remaining > 0) {
      const seconds = Math.ceil(remaining / 1000);
      return send_message(
        chat_id,
        t("export_rate_limited").replace("{seconds}", String(seconds)),
        k("home"),
      );
    }

    mark_export_used(chat_id, "users_export");
    await send_message(chat_id, t("export_in_progress"), k("home"));

    try {
      const users = await User.find().lean();

      if (!users || users.length === 0) {
        return send_message(chat_id, t("no_data_to_export"), k("home"));
      }

      const buffer = await build_users_excel_buffer(users);

      await send_document(chat_id, buffer, {
        filename: `users_export_${file_name_timestamp()}.xlsx`,
        caption: `Users export: ${users.length} ta yozuv`,
      });

      return send_message(chat_id, t("export_success"), k("home"));
    } catch (error) {
      console.error("Users export error:", error?.message || error);
      return send_message(chat_id, t("export_error"), k("home"));
    }
  }

  if (check_command(t("export_user_events_excel"), message)) {
    if (user_state?.name) {
      await clearState();
    }

    update_state_name("export_events_0");
    await user.save();
    return send_message(
      chat_id,
      t("enter_user_id_for_events_export"),
      k("back_to_home"),
    );
  }

  if (check_state_name("export_events_0")) {
    const input_value = String(message || "").trim();
    const phone_digits = normalize_phone_digits(input_value);
    const chat_id_candidate = Number(input_value);

    const user_filter = [];

    if (Number.isInteger(chat_id_candidate)) {
      user_filter.push({ chat_id: chat_id_candidate });
    }

    if (phone_digits.length >= 7) {
      user_filter.push({ phone: input_value });
      user_filter.push({ phone: phone_digits });
      user_filter.push({ phone: `+${phone_digits}` });
    }

    if (user_filter.length === 0) {
      return send_message(chat_id, t("invalid_value"), k("back_to_home"));
    }

    const target_user = await User.findOne({ $or: user_filter }).lean();

    if (!target_user) {
      return send_message(chat_id, t("invalid_value"), k("back_to_home"));
    }

    const remaining = get_remaining_cooldown(chat_id, "events_export");
    if (remaining > 0) {
      const seconds = Math.ceil(remaining / 1000);
      await clearState();
      return send_message(
        chat_id,
        t("export_rate_limited").replace("{seconds}", String(seconds)),
        k("home"),
      );
    }

    mark_export_used(chat_id, "events_export");
    await send_message(chat_id, t("export_in_progress"), k("home"));

    try {
      const events = await PricingEvent.find({ chat_id: target_user.chat_id })
        .sort({ created_at: -1 })
        .limit(10000)
        .lean();

      if (!events || events.length === 0) {
        await clearState();
        return send_message(chat_id, t("no_data_to_export"), k("home"));
      }

      const buffer = await build_pricing_events_excel_buffer(events);

      await send_document(chat_id, buffer, {
        filename: `pricing_events_${target_user.chat_id}_${file_name_timestamp()}.xlsx`,
        caption: `PricingEvents export: ${events.length} ta yozuv`,
      });

      await clearState();
      return send_message(chat_id, t("export_success"), k("home"));
    } catch (error) {
      console.error("PricingEvent export error:", error?.message || error);
      await clearState();
      return send_message(chat_id, t("export_error"), k("home"));
    }
  }

  // Device Pricing Command
  if (
    (check_command(t("update_device_price"), message) ||
      check_command(t("add_device_model"), message) ||
      check_command(t("update_model_color"), message) ||
      check_command(t("delete_device_model"), message)) &&
    !user_state?.name
  ) {
    const devices = await Device.find();

    if (check_command(t("update_model_color"), message)) {
      send_message(
        chat_id,
        t("select_device"),
        k("two_row", devices.slice(0, 3)),
      );
    } else {
      send_message(chat_id, t("select_device"), k("two_row", devices));
    }

    if (check_command(t("update_device_price"), message)) {
      update_state_name("update_price_0");
    } else if (check_command(t("update_model_color"), message)) {
      update_state_name("update_model_color_2");
    } else if (check_command(t("add_device_model"), message)) {
      update_state_name("add_device_model_0");
    } else {
      update_state_name("delete_device_model_0");
    }

    return await user.save();
  }

  if (check_state_name("update_model_color_2")) {
    const devices = await Device.find();
    const device = devices
      .slice(0, 3)
      .find((device) => device.name === message);

    if (!device) {
      return send_message(chat_id, t("invalid_value"), k("two_row", devices));
    }

    send_message(chat_id, t("device_model"), k("two_row", device.models));

    update_state_data("device", device);
    update_state_name("update_model_color_3");
    return await user.save();
  }

  if (check_state_name("update_model_color_3")) {
    const models = state_data.device.models;
    const model = models.find((m) => m.name === message);

    if (!model) {
      return send_message(chat_id, t("invalid_value"), k("two_row", models));
    }

    send_message(
      chat_id,
      texts.enter_new_moldel_colors(model.colors).uz,
      k("back_to_home"),
    );

    update_state_data("model", model);
    update_state_name("update_model_color_4");
    return await user.save();
  }

  if (check_state_name("update_model_color_4")) {
    const { model, device } = state_data;

    const newColors =
      message?.split(",")?.map((color) => ({
        name: color?.trim(),
      })) || [];

    if (!newColors || newColors?.length === 0) {
      return send_message(chat_id, t("invalid_value"), k("back_to_home"));
    }

    const deviceDB = await Device.findOne({ name: device.name });
    const modelDB = deviceDB.models.find((m) => m.name === model.name);
    modelDB.colors = newColors;

    send_message(chat_id, t("update_success"), k("home"));

    clearState();
    return await deviceDB.save();
  }

  // Step 0
  if (
    check_state_name("update_price_0") ||
    check_state_name("delete_device_model_0")
  ) {
    const devices = await Device.find();
    const device = devices.find((device) => device.name === message);

    if (!device) {
      return send_message(chat_id, t("invalid_value"), k("two_row", devices));
    }

    const formatted_device_models = () => {
      if (check_command(device.name, "iwatch")) {
        return device.models.flatMap((model) =>
          model.sizes.map((size) => ({
            name: `${model.name}, ${size.name}`,
          })),
        );
      }

      if (check_command(device.name, "airpods")) return device.models;

      return device.models.flatMap((model) =>
        model.storages.map((storage) => ({
          name: `${model.name}, ${storage.name}`,
        })),
      );
    };

    send_message(
      chat_id,
      t("device_model"),
      k("two_row", formatted_device_models()),
    );

    update_state_data("device_id", device._id);

    if (check_state_name("update_price_0")) update_state_name("update_price_1");
    else update_state_name("delete_device_model_1");

    return await user.save();
  }

  // Step 1 (Model Selection)
  if (
    check_state_name("update_price_1") ||
    check_state_name("delete_device_model_1")
  ) {
    const device = await Device.findById(state_data.device_id);
    const [model_name, model_type] = message?.split(", ") || [];
    const model = device.models.find(({ name }) =>
      check_command(name, model_name),
    );

    if (!model) {
      const formatted_device_models = () => {
        if (check_command(device.name, "iwatch")) {
          return device.models.flatMap((model) =>
            model.sizes.map((size) => ({
              name: `${model.name}, ${size.name}`,
            })),
          );
        }

        if (check_command(device.name, "airpods")) return device.models;

        return device.models.flatMap((model) =>
          model.storages.map((storage) => ({
            name: `${model.name}, ${storage.name}`,
          })),
        );
      };

      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", formatted_device_models()),
      );
    }

    if (check_state_name("update_price_1")) {
      update_state_data("model", { name: model_name, type: model_type });
      send_message(chat_id, t("enter_new_price"), k("back_to_home"));
      update_state_name("update_price_2");
      return await user.save();
    }

    try {
      // Delete model
      if (check_command(device.name, "iwatch")) {
        const model = device.models.find((m) =>
          check_command(m.name, model_name),
        );
        if (model?.sizes?.length > 1) {
          model.sizes = model.sizes.filter(
            (s) => !check_command(s.name, model_type),
          );
        } else {
          device.models = device.models.filter(
            (m) => !check_command(m.name, model_name),
          );
        }
      } else if (check_command(device.name, "airpods")) {
        device.models = device.models.filter(
          (m) => !check_command(m.name, model_name),
        );
      } else {
        const model = device.models.find((m) =>
          check_command(m.name, model_name),
        );
        if (model?.storages?.length > 1) {
          model.storages = model.storages.filter(
            (s) => !check_command(s.name, model_type),
          );
        } else {
          device.models = device.models.filter(
            (m) => !check_command(m.name, model_name),
          );
        }
      }

      await device.save();
      send_message(chat_id, t("model_delete_success"), k("home"));
    } catch {
      send_message(chat_id, t("model_delete_error"), k("home"));
    }

    return clearState();
  }

  // Step 2 (Update price)
  if (check_state_name("update_price_2")) {
    const model_storage = state_data?.model;
    const device = await Device.findById(state_data?.device_id);
    const amount = Number(message?.replace(/\D/g, ""));

    if (typeof amount !== "number" || amount === NaN || amount <= 0) {
      return send_message(chat_id, t("invalid_value"));
    }

    try {
      if (check_command(device.name, "iwatch")) {
        const model = device.models.find((m) => m.name === model_storage.name);
        const size = model?.sizes?.find((s) => s.name === model_storage.type);
        if (size) size.price = amount;
      } else if (check_command(device.name, "airpods")) {
        const model = device.models.find((m) => m.name === model_storage.name);
        if (model) model.price = amount;
      } else {
        const model = device.models.find((m) => m.name === model_storage.name);
        const storage = model?.storages?.find(
          (s) => s.name === model_storage.type,
        );
        if (storage) storage.price = amount;
      }

      await device.save();

      send_message(chat_id, t("update_success"), k("home"));
    } catch {
      send_message(chat_id, t("update_error"), k("home"));
    }

    return clearState();
  }

  // Step 0 (Add model
  if (check_state_name("add_device_model_0")) {
    const devices = await Device.find();
    const device = devices.find((d) => d.name === message);

    if (!device) {
      return send_message(chat_id, t("invalid_value"), k("two_row", devices));
    }

    const device_name = device.name.toLowerCase().trim();

    const formatted_device_model_message = () => {
      if (check_command(device_name, "iwatch")) {
        return `*Qurilma modelini qo'shish 🆕*\n\nYangi  qurilma modelini qo'shish uchun 1ta xabarda Model nomi, o'lchami va narxini kiriting.\n\nMisol uchun: *iWatch SE 2022, 40mm, 140*`;
      }

      if (check_command(device_name, "airpods")) {
        return `*Qurilma modelini qo'shish 🆕*\n\nYangi  qurilma modelini qo'shish uchun 1ta xabarda Model nomi va narxini kiriting.\n\nMisol uchun: *AirPods 2.1, 30*`;
      }

      return `*Qurilma modelini qo'shish 🆕*\n\nYangi  qurilma modelini qo'shish uchun 1ta xabarda Model nomi, xotirasi va narxini kiriting.\n\nMisol uchun: *iPhone 11, 128gb, 700*`;
    };

    send_message(chat_id, formatted_device_model_message(), k("back_to_home"));
    update_state_data("device_name", device.name);
    update_state_name("add_device_model_1");
    return await user.save();
  }

  // Step 1 (Add model)
  if (check_state_name("add_device_model_1")) {
    const device_name = state_data?.device_name;

    const data =
      message
        ?.split(",")
        ?.map((i) => i?.trim())
        ?.filter((i) => i?.length > 0) || [];

    if (
      !data ||
      data?.length < 2 ||
      (check_command(device_name, "airpods") && !isNumber(Number(data[1]))) ||
      (!check_command(device_name, "airpods") &&
        (data?.length < 3 || !isNumber(Number(data[2]))))
    ) {
      return send_message(chat_id, t("invalid_value"), k("back_to_home"));
    }

    const device = await Device.findOne({
      name: new RegExp(`^${device_name}$`, "i"),
    });

    if (!device) {
      await clearState();
      return send_message(chat_id, t("invalid_device"), k("home"));
    }

    // iWatch
    if (check_command(device_name, "iwatch")) {
      const [model_name, model_size, price] = data;
      let model = device.models.find((m) => check_command(m.name, model_name));

      if (model) {
        model.sizes.push({ name: model_size, price: Number(price) });
      } else {
        device.models.push({
          name: model_name,
          sizes: [{ name: model_size, price: Number(price) }],
        });
      }
    }

    // AirPods
    else if (check_command(device_name, "airpods")) {
      const [model_name, price] = data;

      device.models.push({
        name: model_name,
        price: Number(price),
      });
    }

    // iPhone, iPad, MacBook
    else {
      const [model_name, storage_name, price] = data;
      let model = device.models.find((m) => check_command(m.name, model_name));

      if (model) {
        model.storages.push({ name: storage_name, price: Number(price) });
      } else {
        device.models.push({
          name: model_name,
          storages: [{ name: storage_name, price: Number(price) }],
        });
      }
    }

    device.models.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

    device.models.forEach((model) => {
      if (model.storages) {
        model.storages.sort((x, y) =>
          x.name.localeCompare(y.name, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        );
      }
      if (model.sizes) {
        model.sizes.sort((x, y) =>
          x.name.localeCompare(y.name, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        );
      }
    });

    try {
      await device.save();
      await clearState();
      return send_message(chat_id, t("model_add_success"), k("home"));
    } catch {
      return send_message(chat_id, t("model_add_error"), k("home"));
    }
  }
};

module.exports = admin_actions;
