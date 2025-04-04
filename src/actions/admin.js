const {
  send_message,
  check_command,
  extract_numbers,
  update_user_language,
  check_user_membership,
  send_membership_message,
  send_language_selection_message,
} = require("../utils");
const texts = require("../texts");
const { devices } = require("../db");
const keyboards = require("../keyboards");
const run_steps = require("../steps/index");
const use_user_state = require("../hooks/use_user_state");

const admin_actions = async ({
  user,
  text: message,
  chat: { id: chat_id },
}) => {
  const user_state = user?.state;
  const user_language = user?.language_code;
  const user_state_data = user?.state_data;
  const t = (text) => texts[text]["uz"];
  const k = (keyboard_name, data) => ({
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.admin[keyboard_name](data),
    },
  });

  const {
    get_state_name,
    get_state_data,
    check_state_name,
    update_state_data,
    update_state_name,
  } = use_user_state(user);

  const state_data = get_state_data();
  const state_name = get_state_name();
  const is_back = check_command(t("back"), message);

  if (check_command("/start", message) && !user_state?.name) {
    return send_message(chat_id, t("greeting"), k("home"));
  }

  // Help
  if (check_command(t("home"), message)) {
    user.state.name = null;
    user.state.data = null;
    return send_message(chat_id, t("cancel"), k("home"));
  }

  // Device Pricing Command
  if (check_command(t("update_device_price"), message) && !user_state?.name) {
    send_message(chat_id, t("select_device"), k("two_row", devices));
    return update_state_name("update_price_0"); // Update user state name
  }

  // Step 0
  if (check_state_name("update_price_0")) {
    const device = devices.find((device) => device.name === message);

    if (!device && !is_back) {
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
    return update_state_name("update_price_1"); // Update user state name
  }

  // Step 1 (Model Selection)
  if (check_state_name("update_price_1")) {
    const device = state_data?.device;
    const [model_name, model_type] = message?.split(", ") || [];
    const model = device.models.find((model) => model.name === model_name);

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

    // Update user state data
    update_state_data("model", { name: model_name, type: model_type });

    send_message(chat_id, t("enter_new_price"), k("back_to_home"));
    return update_state_name("update_price_2"); // Update user state name
  }

  // Step 2 (Model Type Selection)
  if (check_state_name("update_price_2")) {
    const model_storage = state_data?.model;
    const device_storage = state_data?.device;
    const amount = Number(message?.replace(/\D/g, ""));

    console.log(amount);

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
    } catch {
      send_message(chat_id, t("update_error"), k("home"));
    }

    user.state.data = null; // Clear user state data
    return send_message(chat_id, t("update_success"), k("home"));
  }
};

module.exports = admin_actions;
