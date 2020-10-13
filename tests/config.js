const mongoose = require("mongoose");
const Models = require("../database/models/index");

const {clearDataFromAModel} = require("./utils/generalUtils");

require("dotenv").config();

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_TEST_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
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
