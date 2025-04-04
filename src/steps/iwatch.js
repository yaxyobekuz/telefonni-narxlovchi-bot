const {
  send_message,
  check_command,
  send_iwatch_pricing_message,
} = require("../utils");

const iwatch_steps = ({
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

  // Step 2 (Size Selection)
  if (check_state_name("step_2")) {
    const model = state_data.model;
    const sizes = model.sizes;
    const size = sizes.find((storage) => storage.name === message);

    if (is_back) {
      return send_message(chat_id, t("device_size"), k("two_row", sizes));
    }

    update_state_name("step_3"); // Update user state name
    update_state_data("size", size); // Update user state data

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

    return send_message(chat_id, t("device_box_docs"), k("yes_or_no"));
  }

  // Step 4 (Box Docs Selection)
  if (check_state_name("step_4")) {
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

    update_state_name("step_5"); // Update user state name
    update_state_data("box_docs", message); // Update user state data

    return send_message(chat_id, t("device_strap"), k("yes_or_no"));
  }

  // Step 5 (Strap Selection)
  if (check_state_name("step_5")) {
    if (
      !is_back &&
      !check_command(t("no"), message) &&
      !check_command(t("yes"), message)
    ) {
      return send_message(chat_id, t("invalid_value"), k("yes_or_no"));
    }

    if (is_back) {
      return send_message(chat_id, t("device_strap"), k("yes_or_no"));
    }

    update_state_name("step_6"); // Update user state name
    update_state_data("strap", message); // Update user state data

    return send_message(chat_id, t("device_charger"), k("yes_or_no"));
  }

  // Step 6 (Charger Selection)
  if (check_state_name("step_6")) {
    if (
      !is_back &&
      !check_command(t("no"), message) &&
      !check_command(t("yes"), message)
    ) {
      return send_message(chat_id, t("invalid_value"), k("yes_or_no"));
    }

    if (is_back) {
      return send_message(chat_id, t("device_charger"), k("yes_or_no"));
    }

    // Update user state data
    update_state_data("charger", message);

    // Send pricing message
    send_iwatch_pricing_message({ k, t, user, update_state_name });
  }
};

module.exports = iwatch_steps;
