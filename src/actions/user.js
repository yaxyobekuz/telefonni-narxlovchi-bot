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
const Stats = require("../models/Stats");
const keyboards = require("../keyboards");
const Device = require("../models/Device");
const run_steps = require("../steps/index");
const use_user_state = require("../hooks/use_user_state");

const user_actions = async ({
  user,
  contact,
  text: message,
  chat: { id: chat_id },
}) => {
  const user_state = user?.state;
  const user_language = user?.language_code;
  const t = (text) => texts[text][user_language];
  const k = (keyboard_name, argument_2) => ({
    reply_markup: {
      resize_keyboard: true,
      keyboard: keyboards.user[keyboard_name](user_language, argument_2),
    },
  });

  const {
    get_state_name,
    get_state_data,
    check_state_name,
    update_state_data,
    update_state_name,
    clear_state_data,
  } = use_user_state(user);

  const state_data = get_state_data();
  const state_name = get_state_name();
  const is_back = check_command(t("back"), message);
  const is_awaiting_contact = check_state_name("awaiting_contact");

  if (
    check_command(t("change_language"), message) ||
    (user && !user?.language_code && !check_state_name("language_selection"))
  ) {
    return send_language_selection_message(chat_id);
  }

  if (check_state_name("language_selection")) {
    return update_user_language(chat_id, message);
  }

  if (is_awaiting_contact) {
    if (!contact || contact.user_id !== chat_id) {
      return send_message(chat_id, t("invalid_contact"), {
        reply_markup: {
          resize_keyboard: true,
          keyboard: [[{ request_contact: true, text: t("send_contact") }]],
        },
      });
    }

    const stats = await Stats.findOne();

    stats.registered_users += 1;
    await stats.save();

    user.phone = contact.phone_number;
    update_state_name(null);
    await user.save();

    return send_message(chat_id, t("registration_successful"), k("home"));
  }

  if (check_command("/start", message)) {
    update_state_name(null);
    await user.save();
    return send_message(chat_id, t("greeting"), k("home"));
  }

  if (check_command(t("help"), message) && !user_state?.name) {
    return send_message(chat_id, t("contact"), {
      parse_mode: "HTML",
      reply_markup: {
        resize_keyboard: true,
        inline_keyboard: keyboards.user.admin(user_language),
      },
    });
  }

  // Pricing bosqichi
  if (check_command(t("pricing"), message)) {
    const is_member = await check_user_membership(chat_id);
    if (!is_member) return send_membership_message(chat_id, user_language);

    update_state_name("step_0");
    await user.save();

    const devices = await Device.find();
    return send_message(chat_id, t("select_device"), k("two_row", devices));
  }

  if (is_back && state_name) {
    const step = extract_numbers(String(state_name))[0] - 1;

    if (step < 0) {
      clear_state_data();
      update_state_name(null);
      await user.save();
      return send_message(chat_id, t("cancel"), k("home"));
    }

    update_state_name("step_" + step);
    await user.save();
  }

  // Step 0: qurilma tanlash
  if (check_state_name("step_0")) {
    const device = await Device.findOne({ name: message });

    if (!device && !is_back) {
      const all_devices = await Device.find();
      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", all_devices)
      );
    }

    if (is_back) {
      const all_devices = await Device.find();
      return send_message(
        chat_id,
        t("select_device"),
        k("two_row", all_devices)
      );
    }

    update_state_name("step_1");
    update_state_data("device", device);
    await user.save();

    return send_message(
      chat_id,
      t("device_model"),
      k("two_row", device.models)
    );
  }

  // Step 1: model tanlash
  if (check_state_name("step_1")) {
    const device = get_state_data().device;

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

    update_state_name("step_2");
    update_state_data("model", model);
    await user.save();

    if (check_command("AirPods", device.name)) {
      return send_message(
        chat_id,
        t("device_status"),
        k("two_row", device.deductions.condition)
      );
    }

    if (check_command("iWatch", device.name)) {
      return send_message(chat_id, t("device_size"), k("two_row", model.sizes));
    }

    return send_message(
      chat_id,
      t("device_memory"),
      k("two_row", model.storages)
    );
  }

  // Other steps
  if (extract_numbers(state_name)[0] > 0) {
    run_steps({
      t,
      k,
      user,
      chat_id,
      message,
      state_data,
      get_state_name,
      get_state_data,
      check_state_name,
      update_state_name,
      update_state_data,
    });
  }
};

module.exports = user_actions;
