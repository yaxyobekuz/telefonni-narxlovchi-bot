const {
  create_user,
  send_message,
  check_command,
  extract_numbers,
  update_user_language,
  check_user_membership,
  send_membership_message,
  send_phone_pricing_message,
  send_request_contact_message,
  send_language_selection_message,
} = require("./src/utils");
const bot = require("./src/bot");
const express = require("express");
const texts = require("./src/texts");
const keyboards = require("./src/keyboards");
const { users, devices } = require("./src/db");
const run_steps = require("./src/steps/index");
const use_user_state = require("./src/hooks/use_user_state");

bot.on("message", ({ from, text: message, chat, contact }) => {
  const chat_id = chat.id;
  const user = users[chat_id];
  const user_state = user?.state;
  const user_language = "uz";
  const user_state_data = user?.state_data;
  const t = (text) => texts[text][user_language];
  const k = (keyboard_name, argument_2) => ({
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user[keyboard_name](user_language, argument_2),
    },
  });

  if (!user) {
    users[chat_id] = from;

    // Greeting message
    send_message(chat_id, t("greeting"), k("home"));
  }

  //
  const {
    get_state_name,
    get_state_data,
    check_state_name,
    update_state_name,
    update_state_data,
  } = use_user_state(user);
  const state_data = get_state_data();
  const state_name = get_state_name();
  const is_back = check_command(t("back"), message);

  // Device Pricing Command
  if (
    check_command("/start", message) ||
    check_command(t("pricing"), message)
  ) {
    send_message(chat_id, t("select_device"), k("two_row", devices));
    return update_state_name("step_0"); // Update user state name
  }

  // Back
  if (is_back && state_name) {
    const step = extract_numbers(String(state_name))[0] - 1;

    if (step < 0) {
      send_message(chat_id, t("cancel"), k("home"));

      user.state.data = {}; // Clear state data
      return update_state_name(); // Clear user state
    }

    update_state_name("step_" + step);
  }

  // Step 0 (Device Selection)
  if (check_state_name("step_0")) {
    const device = devices.find((device) => device.name === message);

    if (!device && !is_back) {
      return send_message(chat_id, t("invalid_value"), k("two_row", devices));
    }

    if (is_back) {
      return send_message(chat_id, t("select_device"), k("two_row", devices));
    }

    send_message(chat_id, t("device_model"), k("two_row", device.models));

    update_state_name("step_1"); // Update user state name
    return update_state_data("device", device); // Update user state data
  }

  // Step 1 (Model Selection)
  if (check_state_name("step_1")) {
    const device = state_data.device;
    const model = device.models.find((model) => model.name === message);

    if (!model && !is_back) {
      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", device.models)
      );
    }

    if (is_back) {
      return send_message(
        chat_id,
        t("device_model"),
        k("two_row", device.models)
      );
    }

    update_state_name("step_2"); // Update user state name
    update_state_data("model", model); // Update user state data

    if (check_command("AirPods", device.name)) {
      return send_message(
        chat_id,
        t("device_status"),
        k("two_row", device.deductions.condition)
      );
    }

    return send_message(
      chat_id,
      t("device_memory"),
      k("two_row", model.storages)
    );
  }

  // Other steps (2,3,4...)
  run_steps({
    t,
    k,
    user,
    chat_id,
    message,
    state_data,
    user_state,
    get_state_name,
    get_state_data,
    user_state_data,
    check_state_name,
    update_state_name,
    update_state_data,
  });
});
