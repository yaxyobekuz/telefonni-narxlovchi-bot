const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  chat_id: {
    type: Number,
    unique: true,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  phone: {
    default: null,
    type: String,
  },
  language_code: {
    default: null,
    type: String,
  },
  state: {
    name: {
      type: String,
      default: null,
    },
    data: {
      default: {},
      type: mongoose.Schema.Types.Mixed,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
