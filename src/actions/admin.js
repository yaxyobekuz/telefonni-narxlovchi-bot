// Texts
const texts = require("../texts");

// Keyboards
const keyboards = require("../keyboards");

// DataBase
const { devices, statistics } = require("../db");

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

  // Step 0 (Device Selection)
  if (
    check_state_name("update_price_0") ||
    check_state_name("delete_device_model_0")
  ) {
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

    update_state_data("device", device); // Update user state data

    // Update user state name
    if (check_state_name("update_price_0")) update_state_name("update_price_1");
    else update_state_name("delete_device_model_1");

    return await user.save();
  }

  // Step 1 (Model Selection)
  if (
    check_state_name("update_price_1") ||
    check_state_name("delete_device_model_1")
  ) {
    const device = state_data?.device;
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
      // Update user state data
      update_state_data("model", { name: model_name, type: model_type });

      send_message(chat_id, t("enter_new_price"), k("back_to_home"));
      update_state_name("update_price_2"); // Update user state name
      return await user.save();
    }

    try {
      const device_name = device?.name;

      const deviceDB = devices.find(({ name }) =>
        check_command(name, device?.name)
      );

      const modelDB = deviceDB.models.find(({ name }) =>
        check_command(name, model_name)
      );

      // iWatch
      if (check_command(device_name, "iwatch")) {
        if (modelDB?.sizes?.length > 1) {
          modelDB.sizes = modelDB.sizes.filter(
            ({ name }) => !check_command(name, model_type)
          );
        } else {
          deviceDB.models = deviceDB.models.filter(
            ({ name }) => !check_command(name, model_name)
          );
        }
      }

      // AirPods
      else if (check_command(device_name, "airpods")) {
        deviceDB.models = deviceDB.models.filter(
          ({ name }) => !check_command(name, model_name)
        );
      }

      // Others
      else {
        if (modelDB?.storages?.length > 1) {
          modelDB.storages = modelDB.storages.filter(
            ({ name }) => !check_command(name, model_type)
          );
        } else {
          deviceDB.models = deviceDB.models.filter(
            ({ name }) => !check_command(name, model_name)
          );
        }
      }

      send_message(chat_id, t("model_delete_success"), k("home"));
    } catch {
      send_message(chat_id, t("model_delete_error"), k("home"));
    }

    return clearState();
  }

  // Step 2 (Model Type Selection)
  if (check_state_name("update_price_2")) {
    const model_storage = state_data?.model;
    const device_storage = state_data?.device;
    const amount = Number(message?.replace(/\D/g, ""));

    if (typeof amount !== "number" || amount === NaN || amount <= 0) {
      return send_message(chat_id, t("invalid_value"));
    }

    const data = () => {
      if (check_command(device_storage.name, "iwatch")) {
        return devices
          .find((device) => device.name === device_storage.name)
          .models.find((model) => model.name === model_storage.name)
          .sizes.find((size) => size.name === model_storage.type);
      }

      if (check_command(device_storage.name, "AirPods")) {
        return devices
          .find((device) => device.name === device_storage.name)
          .models.find((model) => model.name === model_storage.name);
      }

      return devices
        .find((device) => device.name === device_storage.name)
        .models.find((model) => model.name === model_storage.name)
        .storages.find((storage) => storage.name === model_storage.type);
    };

    try {
      data().price = amount;
      send_message(chat_id, t("update_success"), k("home"));
    } catch {
      send_message(chat_id, t("update_error"), k("home"));
    }

    return clearState(); // Clear user state name
  }

  // Step 0 (Device Selection For add model)
  if (check_state_name("add_device_model_0")) {
    const device_name = devices
      .find((device) => device.name === message)
      ?.name?.toLowerCase()
      ?.trim();

    if (!device_name) {
      return send_message(chat_id, t("invalid_value"), k("two_row", devices));
    }

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

    update_state_data("device_name", device_name); // Update user state data
    update_state_name("add_device_model_1"); // Update user state name
    return await user.save();
  }

  // Step 1 (Add model)
  if (check_state_name("add_device_model_1")) {
    const device_name = state_data.device_name;

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

    const device = devices.find(({ name }) => check_command(name, device_name));

    // iWatch
    if (check_command(device_name, "iwatch")) {
      const [model_name, model_size, price] = data;
      const model = device.models.find(({ name }) =>
        check_command(name, model_name)
      );

      try {
        if (model) {
          model.sizes.push({ name: model_size, price: Number(price) });
        } else {
          device.models.push({
            name: model_name,
            sizes: [{ name: model_size, price: Number(price) }],
          });
        }

        send_message(chat_id, t("model_add_success"), k("home"));
      } catch {
        send_message(chat_id, t("model_add_error"), k("home"));
      }

      return clearState();
    }

    // AirPods
    if (check_command(device_name, "airpods")) {
      const [model_name, price] = data;
      const model = device.models.find(({ name }) =>
        check_command(name, model_name)
      );

      try {
        if (model) {
          model.price = Number(price);
        } else {
          device.models.push({ name: model_name, price: Number(price) });
        }

        send_message(chat_id, t("model_add_success"), k("home"));
      } catch {
        send_message(chat_id, t("model_add_error"), k("home"));
      }

      return clearState();
    }

    // Others
    const [model_name, model_storage, price] = data;
    const model = device.models.find(({ name }) =>
      check_command(name, model_name)
    );

    try {
      if (model) {
        model.storages.push({ name: model_storage, price: Number(price) });
      } else {
        device.models.push({
          name: model_name,
          storages: [{ name: model_storage, price: Number(price) }],
        });
      }

      send_message(chat_id, t("model_add_success"), k("home"));
    } catch {
      send_message(chat_id, t("model_add_error"), k("home"));
    }

    return clearState();
  }
};

module.exports = admin_actions;
