// Texts
const texts = require("../texts");

// Keyboards
const keyboards = require("../keyboards");

// DataBase
const Device = require("../models/Device");
const { statistics } = require("../db");

// Hooks
const use_user_state = require("../hooks/use_user_state");

// Utils
const { send_message, check_command, isNumber } = require("../utils");

const admin_actions = async ({
  user,
  text: message,
  chat: { id: chat_id },
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
    let click_stats = "";

    Object.keys(statistics.clicks).forEach((name) => {
      click_stats += "\n";
      click_stats += `*${name}:* ${statistics.clicks[name]?.toLocaleString()}`;
    });

    return send_message(
      chat_id,
      `*${t(
        "statistics"
      )}*\n\n*💸 Narxlash bo'yicha:*\n${click_stats}\n\n*👥 Jami foydalanuvchilar:* ${statistics.users?.toLocaleString()}\n\n*📞 Ro'yxatdan o'tgan foydalanuvchilar:* ${statistics.registered_users?.toLocaleString()}`,
      k("home")
    );
  }

  // Device Pricing Command
  if (
    (check_command(t("update_device_price"), message) ||
      check_command(t("add_device_model"), message) ||
      check_command(t("delete_device_model"), message)) &&
    !user_state?.name
  ) {
    const devices = await Device.find();
    send_message(chat_id, t("select_device"), k("two_row", devices));

    if (check_command(t("update_device_price"), message)) {
      update_state_name("update_price_0");
    } else if (check_command(t("add_device_model"), message)) {
      update_state_name("add_device_model_0");
    } else {
      update_state_name("delete_device_model_0");
    }

    return await user.save();
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
          }))
        );
      }

      if (check_command(device.name, "airpods")) return device.models;

      return device.models.flatMap((model) =>
        model.storages.map((storage) => ({
          name: `${model.name}, ${storage.name}`,
        }))
      );
    };

    send_message(
      chat_id,
      t("device_model"),
      k("two_row", formatted_device_models())
    );

    update_state_data("device_id", device._id); // MongoDB ID saqlanadi

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
      check_command(name, model_name)
    );

    if (!model) {
      const formatted_device_models = () => {
        if (check_command(device.name, "iwatch")) {
          return device.models.flatMap((model) =>
            model.sizes.map((size) => ({
              name: `${model.name}, ${size.name}`,
            }))
          );
        }

        if (check_command(device.name, "airpods")) return device.models;

        return device.models.flatMap((model) =>
          model.storages.map((storage) => ({
            name: `${model.name}, ${storage.name}`,
          }))
        );
      };

      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", formatted_device_models())
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
          check_command(m.name, model_name)
        );
        if (model?.sizes?.length > 1) {
          model.sizes = model.sizes.filter(
            (s) => !check_command(s.name, model_type)
          );
        } else {
          device.models = device.models.filter(
            (m) => !check_command(m.name, model_name)
          );
        }
      } else if (check_command(device.name, "airpods")) {
        device.models = device.models.filter(
          (m) => !check_command(m.name, model_name)
        );
      } else {
        const model = device.models.find((m) =>
          check_command(m.name, model_name)
        );
        if (model?.storages?.length > 1) {
          model.storages = model.storages.filter(
            (s) => !check_command(s.name, model_type)
          );
        } else {
          device.models = device.models.filter(
            (m) => !check_command(m.name, model_name)
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
          (s) => s.name === model_storage.type
        );
        if (storage) storage.price = amount;
      }

      const res = await device.save();

      console.log(res.models[0]);

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
      })
    );

    device.models.forEach((model) => {
      if (model.storages) {
        model.storages.sort((x, y) =>
          x.name.localeCompare(y.name, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      }
      if (model.sizes) {
        model.sizes.sort((x, y) =>
          x.name.localeCompare(y.name, undefined, {
            numeric: true,
            sensitivity: "base",
          })
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
