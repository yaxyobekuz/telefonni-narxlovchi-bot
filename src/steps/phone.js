const {
  send_message,
  check_command,
  send_phone_pricing_message,
} = require("../utils");

const phone_steps = ({
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
    const memory = model.storages.find((storage) => storage.name === message);

    if (!memory && !is_back) {
      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", model.storages)
      );
    }

    if (is_back) {
      return send_message(
        chat_id,
        t("device_memory"),
        k("two_row", model.storages)
      );
    }

    update_state_name("step_3"); // Update user state name
    update_state_data("memory", memory); // Update user state data

    return send_message(
      chat_id,
      t("device_battery_capacity"),
      k("two_row", device.deductions.battery)
    );
  }

  // Step 3 (Battery Capacity)
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
        k("two_row", device.deductions.battery)
      );
    }

    update_state_name("step_4"); // Update user state name
    update_state_data("battery_capacity", battery); // Update user state data

    return send_message(
      chat_id,
      t("device_screen_scratch"),
      k("two_row", device.deductions.screen)
    );
  }

  // Step 4 (Screen Scratch)
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
        k("two_row", device.deductions.screen)
      );
    }

    update_state_name("step_5"); // Update user state name
    update_state_data("screen", screen); // Update user state data

    return send_message(chat_id, t("device_box_docs"), k("yes_or_no"));
  }

  // Step 6 (Box Docs)
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

    update_state_name("step_6"); // Update user state name
    update_state_data("box_docs", message); // Update user state data

    return send_message(
      chat_id,
      t("device_country"),
      k("two_row", device.deductions.countries)
    );
  }

  // Step 8 (Country)
  if (check_state_name("step_6")) {
    const countries = device.deductions.countries;
    const country = countries.find((country) => country.name === message);

    if (!country && !is_back) {
      return send_message(chat_id, t("invalid_value"), k("two_row", countries));
    }

    if (is_back) {
      return send_message(
        chat_id,
        t("device_country"),
        k("two_row", device.deductions.countries)
      );
    }

    // Update user state data
    update_state_data("country", country);

    // Send pricing message
    send_phone_pricing_message({ k, t, user, update_state_name });
  }
};

module.exports = phone_steps;
