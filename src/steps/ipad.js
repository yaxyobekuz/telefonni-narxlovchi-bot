const {
  send_message,
  check_command,
  send_ipad_pricing_message,
} = require("../utils");

const ipad_steps = ({
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

    return send_message(chat_id, t("device_box_docs"), k("yes_or_no"));
  }

  // Step 3 (Box Docs Selection)
  if (check_state_name("step_3")) {
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

    update_state_name("step_4"); // Update user state name
    update_state_data("box_docs", message); // Update user state data

    return send_message(
      chat_id,
      t("device_battery_capacity"),
      k("two_row", device.deductions.battery)
    );
  }

  // Step 4 (Battery Capacity Selection)
  if (check_state_name("step_4")) {
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

    update_state_name("step_5"); // Update user state name
    update_state_data("battery_capacity", battery); // Update user state data

    return send_message(
      chat_id,
      t("device_appearance"),
      k("two_row", device.deductions.appearance)
    );
  }

  // Step 6 (Appearance Selection)
  if (check_state_name("step_5")) {
    const appearances = device.deductions.appearance;
    const appearance = appearances.find(
      (appearance) => appearance.name === message
    );

    if (!appearance && !is_back) {
      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", appearances)
      );
    }

    if (is_back) {
      return send_message(
        chat_id,
        t("device_appearance"),
        k("two_row", appearances)
      );
    }

    // Update user state data
    update_state_data("appearance", appearance);

    // Send pricing message
    send_ipad_pricing_message({ k, t, user, update_state_name });
  }
};

module.exports = ipad_steps;
