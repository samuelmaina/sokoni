const mongoose = require("mongoose");
const {MONGO_TEST_URI} = require("../config");
const connector = require("../util/connectToDb");
const connectToDb = async () => {
  try {
    await connector(MONGO_TEST_URI);
  } catch (error) {
    throw new Error(error);
  }
};

const closeConnectionToBd = async () => {
  try {
    return await mongoose.disconnect();
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  closeConnectionToBd,
  connectToDb,
};
