const {
  send_message,
  check_command,
  send_macbook_pricing_message,
} = require("../utils");

const macbook_steps = async ({
  user,
  message,
  chat_id,
  state_data,
  k, // keyboard
  t, // translate
  check_state_name,
  update_state_name,
  update_state_data,
}) => {
  const device = state_data?.device || {};
  const is_back = check_command(t("back"), message);

  // Step 2 (Memory Selection)
  if (check_state_name("step_2")) {
    const model = state_data.model;
    const storages = model.storages;
    const memory = storages.find((storage) => storage.name === message);

    if (!memory && !is_back) {
      return send_message(chat_id, t("invalid_value"), k("two_row", storages));
    }

    if (is_back) {
      return send_message(chat_id, t("device_memory"), k("two_row", storages));
    }

    update_state_name("step_3"); // Update user state name
    update_state_data("memory", memory); // Update user state data
    await user.save();

    return send_message(
      chat_id,
      t("device_battery_capacity"),
      k("two_row", device.deductions.battery)
    );
  }

  // Step 3 (Battery Capacity Selection)
  if (check_state_name("step_3")) {
    const battery_capacities = device.deductions.battery;
    const battery = battery_capacities.find(
      (battery) => battery.name === message
    );

    if (!battery && !is_back) {
      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", battery_capacities)
      );
    }

    if (is_back) {
      return send_message(
        chat_id,
        t("device_battery_capacity"),
        k("two_row", battery_capacities)
      );
    }

    update_state_name("step_4"); // Update user state name
    update_state_data("battery_capacity", battery); // Update user state data
    await user.save();

    return send_message(
      chat_id,
      t("device_screen_scratch"),
      k("two_row", device.deductions.screen)
    );
  }

  // Step 4 (Screen Scratch Selection)
  if (check_state_name("step_4")) {
    const screen_scratches = device.deductions.screen;
    const screen = screen_scratches.find((screen) => screen.name === message);

    if (!screen && !is_back) {
      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", screen_scratches)
      );
    }

    if (is_back) {
      return send_message(
        chat_id,
        t("device_screen_scratch"),
        k("two_row", screen_scratches)
      );
    }

    update_state_name("step_5"); // Update user state name
    update_state_data("screen", screen); // Update user state data
    await user.save();

    return send_message(chat_id, t("device_box_docs"), k("yes_or_no"));
  }

  // Step 5 (Box Docs Selection)
  if (check_state_name("step_5")) {
    if (
      !is_back &&
      !check_command(t("no"), message) &&
      !check_command(t("yes"), message)
    ) {
      return send_message(chat_id, t("invalid_value"), k("yes_or_no"));
    }

    if (is_back) {
      return send_message(chat_id, t("device_box_docs"), k("yes_or_no"));
    }

    // Update user state data
    update_state_data("box_docs", message);
    update_state_name("step_6");
    await user.save();

    return send_message(
      chat_id,
      t("device_color"),
      k("two_row", state_data.model.colors)
    );
  }

  // Step 6 (Color Selection)
  if (check_state_name("step_6")) {
    const colors = state_data.model.colors;
    const color = colors.find((c) => c.name === message);

    if (!color && !is_back) {
      return send_message(chat_id, t("invalid_value"), k("two_row", colors));
    }

    if (is_back) {
      return send_message(chat_id, t("device_color"), k("two_row", colors));
    }

    update_state_name(null);
    update_state_data("color", color);
    await user.save();

    // Send pricing message
    send_macbook_pricing_message({ t, id: user.chat_id });
  }
};

module.exports = macbook_steps;
