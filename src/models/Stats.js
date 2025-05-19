const mongoose = require("mongoose");

const numberSchema = {
  default: 0,
  type: Number,
};

const statsSchema = new mongoose.Schema({
  users: numberSchema,
  registered_users: numberSchema,
  clicks: {
    ipad: numberSchema,
    iphone: numberSchema,
    iwatch: numberSchema,
    airpods: numberSchema,
    macbook: numberSchema,
  },
});

module.exports = mongoose.model("Stats", statsSchema);
