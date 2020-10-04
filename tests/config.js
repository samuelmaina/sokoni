const mongoose = require("mongoose");
const Models = require("../database/models/index");

require("dotenv").config();

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_TEST_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });

    //make sure that all the Models we are using are empty before testing.
    for (const ModelName in Models) {
      const Model = Models[ModelName];
      let count = await Model.find();
      count = count.length;
      if (count > 0) {
        console.log(
          `model ${Model.modelName} has some data.We'll clear it before running the test.
          Check to see that all test data is cleared after testing even if the test fail or errors are thrown`
        );
        const documents = await Model.find();
        documents.forEach(async (element) => {
          await Model.findByIdAndDelete(element.id);
        });
      }
    }
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
