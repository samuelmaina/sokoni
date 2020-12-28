const mongoose = require("mongoose");
require("dotenv").config();

const connector = require("../utils/connectToDb");
const MONGO_TEST_URI = process.env.MONGO_TEST_URI;

const connectToDb = async () => {
  try {
    await connector(MONGO_TEST_URI);
  } catch (error) {
    throw new Error(error);
  }
};

const closeConnectionToBd = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  closeConnectionToBd,
  connectToDb,
};
