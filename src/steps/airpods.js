const {
  send_message,
  check_command,
  send_airpods_pricing_message,
} = require("../utils");

const airpods_steps = async ({
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

  // Step 2 (Status/Condition Selection)
  if (check_state_name("step_2")) {
    const conditions = device.deductions.condition;
    const condition = conditions.find(
      (condition) => condition.name === message
    );

    if (!condition && !is_back) {
      return send_message(
        chat_id,
        t("invalid_value"),
        k("two_row", conditions)
      );
    }

    if (is_back) {
      return send_message(
        chat_id,
        t("device_status"),
        k("two_row", k("two_row", conditions))
      );
    }

    update_state_name("step_3"); // Update user state name
    update_state_data("status", condition); // Update user state data
    await user.save();

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

    // Update user state data
    update_state_data("box_docs", message);
    update_state_name(null);
    await user.save();

    // Send pricing message
    send_airpods_pricing_message({ t, id: user.chat_id });
  }
};

module.exports = airpods_steps;
