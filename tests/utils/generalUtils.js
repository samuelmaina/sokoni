const bcrypt = require("bcrypt");
const assert = require("assert");
const mongoose = require("mongoose");
const {User, Admin, Product} = require("../../database/models");

const Models = require("../../database/models");

exports.generateMongooseId = () => {
  return mongoose.Types.ObjectId();
};

exports.clearTheDb = async () => {
  try {
    for (const ModelName in Models) {
      const Model = Models[ModelName];
      const getNoOfDocs = async () => {
        return await Model.find().countDocuments();
      };
      let count = await getNoOfDocs();
      if (count > 0) {
        await this.clearDataFromAModel(Model);
      }
      count = await getNoOfDocs();
      assert.equal(count, 0, "deletion not complete");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

exports.clearDataFromAModel = async Model => {
  const getDocsInModel = async () => {
    return await Model.find();
  };

  const documents = await getDocsInModel();
  for (const document of documents) {
    await Model.findByIdAndDelete(document._id);
  }

  const documentsAfterDeletion = await getDocsInModel();
  assert.equal(
    documentsAfterDeletion.length,
    0,
    `the model (${Model.modelName} not cleared completely.`
  );
};

exports.createNewAdmin = async () => {
  let admin = new Admin({
    name: "Samuel Maina",
    email: "samuelmayna@gmail.com",
    password: await bcrypt.hash("Smainachez88(??", 12),
  });
  admin = await admin.save();
  return admin;
};

exports.createNewAdminWithData = async data => {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const dataToSave = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === "password") continue;
      dataToSave[key] = data[key];
    }
  }
  dataToSave.password = hashedPassword;
  let admin = new Admin(dataToSave);
  admin = await admin.save();
  return admin;
};
exports.createNewUserWithData = async data => {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const dataToSave = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === "password") continue;
      dataToSave[key] = data[key];
    }
  }
  dataToSave.password = hashedPassword;
  let user = new User(dataToSave);
  user = await user.save();
  return user;
};
exports.createNewUser = async () => {
  let user = new User({
    name: "Samuel Maina",
    email: "samuelmayna@gmail.com",
    password: await bcrypt.hash("Smainachez88(??", 12),
  });
  user = await user.save();
  return user;
};

exports.createTestProducts = async (adminId, quantity = 1) => {
  const products = [];
  let product;
  for (let index = 0; index < quantity; index++) {
    product = this.getRandomProductData(adminId);
    product.sellingPrice = (
      (1 + product.percentageProfit / 100) *
      product.buyingPrice
    ).toFixed(2);
    product = new Product(product);
    product = await product.save();
    products[index] = product;
  }
  return products;
};
exports.getRandomProductData = adminId => {
  const data = {};
  const PRODUCT_PROPERTIES = this.PRODUCT_PROPERTIES;
  for (const key in PRODUCT_PROPERTIES) {
    if (key === "adminId") {
      data[key] = adminId;
      continue;
    }
    if (PRODUCT_PROPERTIES[key].type === String) {
      data[key] = `${key} ${Math.floor(Math.random() * 100)}`;
      continue;
    }
    if (PRODUCT_PROPERTIES[key].type === Number) {
      data[key] = Math.floor(Math.random() * 100) + 2;
    }
  }
  return data;
};
exports.PRODUCT_PROPERTIES = {
  title: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  buyingPrice: {
    type: Number,
  },
  percentageProfit: {
    type: Number,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  adminId: {
    type: String,
  },
  category: {
    type: String,
  },
  brand: {
    type: String,
  },
};
