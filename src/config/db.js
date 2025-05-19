require("dotenv").config();
const mongoose = require("mongoose");
const { mongodb_url } = require("../../env.config");

const connectDB = async () => {
  try {
    await mongoose.connect(mongodb_url);
    console.log("MongoDB connected! ✅");
  } catch (err) {
    console.log("MongoDB connection error! ❌", err);
    process.exit(1);
  }
};

module.exports = connectDB;