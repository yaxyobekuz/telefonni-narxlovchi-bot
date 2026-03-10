const mongoose = require("mongoose");

const numberField = {
  type: Number,
  default: 0,
};

const topModelItemSchema = new mongoose.Schema(
  {
    model_name: String,
    count: numberField,
    last_priced_at: Date,
    last_final_price: Number,
  },
  { _id: false }
);

const getDeviceCounterDefault = () => ({
  iphone: 0,
  ipad: 0,
  macbook: 0,
  iwatch: 0,
  airpods: 0,
});

const getModelCountByDeviceDefault = () => ({
  iphone: {},
  ipad: {},
  macbook: {},
  iwatch: {},
  airpods: {},
});

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
  username: {
    default: null,
    type: String,
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
  quick_stats: {
    totals: {
      all_pricings: numberField,
      by_device: {
        type: mongoose.Schema.Types.Mixed,
        default: getDeviceCounterDefault,
      },
      last_priced_at: {
        type: Date,
        default: null,
      },
      last_device_type: {
        type: String,
        default: null,
      },
    },
    model_counts_by_device: {
      type: mongoose.Schema.Types.Mixed,
      default: getModelCountByDeviceDefault,
    },
    top_models_by_device: {
      iphone: {
        type: [topModelItemSchema],
        default: () => [],
      },
      ipad: {
        type: [topModelItemSchema],
        default: () => [],
      },
      macbook: {
        type: [topModelItemSchema],
        default: () => [],
      },
      iwatch: {
        type: [topModelItemSchema],
        default: () => [],
      },
      airpods: {
        type: [topModelItemSchema],
        default: () => [],
      },
    },
  },
});

module.exports = mongoose.model("User", userSchema);
