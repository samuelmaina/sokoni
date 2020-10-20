const assert = require("assert");
const mongoose = require("mongoose");

module.exports = async mongo_uri => {
  try {
    const connection = await mongoose.connect(mongo_uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    assert.ok(connection, "No errors thrown but connection not established.");
  } catch (error) {
    throw new Error(error);
  }
};
