const mongoose = require("mongoose");
const app = require("../../app");
const {connectToDb} = require("../../util/index");

const PORT = 5000;

exports.connectToTestDb = () => {
  const MONGO_TEST_URI = process.env.MONGO_TEST_URI;
  connectToDb(MONGO_TEST_URI, app, PORT);
};
exports.disconnectFromDb = async () => {
  await mongoose.disconnect();
};
