// Steps for different devices
const ipad_steps = require("./ipad");
const phone_steps = require("./phone");
const iwatch_steps = require("./iwatch");
const airpods_steps = require("./airpods");
const macbook_steps = require("./macbook");

// Utils
const { check_command } = require("../utils");

const run_steps = (data) => {
  const device_name = data.state_data.device.name;

  if (check_command("iphone", device_name)) {
    phone_steps(data);
  } else if (check_command("macbook", device_name)) {
    macbook_steps(data);
  } else if (check_command("ipad", device_name)) {
    ipad_steps(data);
  } else if (check_command("iwatch", device_name)) {
    iwatch_steps(data);
  } else if (check_command("airpods", device_name)) {
    airpods_steps(data);
  }
};

module.exports = run_steps;
