const mongoose = require("mongoose");

const numberField = {
  type: Number,
  default: 0,
};

const pricingEventSchema = new mongoose.Schema({
  chat_id: {
    type: Number,
    required: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  device_type: {
    type: String,
    required: true,
    index: true,
  },
  language_code: {
    type: String,
    default: null,
  },
  user_snapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  device_snapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  state_name: {
    type: String,
    default: null,
  },
  state_data_snapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  pricing: {
    initial_price: numberField,
    minus: numberField,
    final_price: numberField,
    screen_deduction: numberField,
    battery_deduction: numberField,
    box_deduction: numberField,
    sim_deduction: numberField,
    appearance_deduction: numberField,
    strap_deduction: numberField,
    charger_deduction: numberField,
    condition_deduction: numberField,
  },
  telegram_payload: {
    message_text: {
      type: String,
      default: "",
    },
    share_text: {
      type: String,
      default: "",
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

pricingEventSchema.index({ chat_id: 1, created_at: -1 });
pricingEventSchema.index({ device_type: 1, created_at: -1 });
pricingEventSchema.index({ "user_snapshot.chat_id": 1, device_type: 1 });

module.exports = mongoose.model("PricingEvent", pricingEventSchema);
