const mongoose = require("mongoose");

require("dotenv").config();

const connectToDb = async () => {
  try {
    return await mongoose.connect(process.env.MONGO_URI, {
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
