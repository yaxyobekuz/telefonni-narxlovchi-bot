const mongoose = require("mongoose");

const NameSchema = new mongoose.Schema({
  name: String,
});

const PriceSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const ModelSchema = new mongoose.Schema({
  name: String,
  price: Number,
  sizes: [PriceSchema],
  colors: [NameSchema],
  storages: [PriceSchema],
});

const DeductionPercentSchema = new mongoose.Schema({
  name: String,
  price: Number,
  percent: Number,
});

const AccessoriesSchema = new mongoose.Schema({
  box: Number,
  cable: Number,
  adapters: [PriceSchema],
});

const DeductionsSchema = new mongoose.Schema({
  sims: [NameSchema],
  accessories: AccessoriesSchema,
  screen: [DeductionPercentSchema],
  battery: [DeductionPercentSchema],
  condition: [DeductionPercentSchema],
  appearance: [DeductionPercentSchema],
});

const DeviceSchema = new mongoose.Schema({
  name: String,
  models: [ModelSchema],
  deductions: DeductionsSchema,
});

module.exports = mongoose.model("Device", DeviceSchema);
