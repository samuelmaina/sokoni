const mongoose = require("mongoose");
const assert = require("assert");
require("dotenv").config();

const MONGO_TEST_URI = process.env.MONGO_TEST_URI;

const connectToDb = async () => {
  try {
    await connector(MONGO_TEST_URI);
  } catch (error) {
    throw new Error(error);
  }
};

const connector = async (mongo_uri) => {
  try {
    const connection = await mongoose.connect(mongo_uri, {
      useUnifiedTopology: false,
      useNewUrlParser: false,
    });
    assert.ok(connection, "No errors thrown but connection not established.");
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
