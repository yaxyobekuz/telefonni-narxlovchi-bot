const mongoose = require("mongoose");

const StorageSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const SizeSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const ModelSchema = new mongoose.Schema({
  name: String,
  storages: [StorageSchema],
  sizes: [SizeSchema],
});

const DeductionPercentSchema = new mongoose.Schema({
  name: String,
  price: Number,
  percent: Number,
});

const AdaptersSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const AccessoriesSchema = new mongoose.Schema({
  box: Number,
  cable: Number,
  adapters: [AdaptersSchema],
});

const SimCardSchema = new mongoose.Schema({
  name: String,
});

const DeductionsSchema = new mongoose.Schema({
  sims: [SimCardSchema],
  colors: [SimCardSchema],
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
