const mongoose = require("mongoose");

require("dotenv").config();

const PORT = process.env.PORT || 3000;

const connectToBb = async (app) => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    if (connection) {
      app.listen(PORT);
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
module.exports = connectToBb;
