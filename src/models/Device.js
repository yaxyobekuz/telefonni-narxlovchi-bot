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
  percent: Number,
});

const DeductionPriceSchema = new mongoose.Schema({
  name: String,
  price: Number,
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

const CountrySchema = new mongoose.Schema({
  name: String,
});

const DeductionsSchema = new mongoose.Schema({
  countries: [CountrySchema],
  accessories: AccessoriesSchema,
  battery: [DeductionPercentSchema],
  condition: [DeductionPercentSchema],
  screen: [DeductionPercentSchema, DeductionPriceSchema],
  appearance: [DeductionPercentSchema, DeductionPriceSchema],
});

const DeviceSchema = new mongoose.Schema({
  name: String,
  models: [ModelSchema],
  deductions: DeductionsSchema,
});

module.exports = mongoose.model("Device", DeviceSchema);
