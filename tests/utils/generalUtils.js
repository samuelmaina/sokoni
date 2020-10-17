const bcrypt = require("bcrypt");
const assert = require("assert");
const {User, Admin, Product} = require("../../database/models");

const Models = require("../../database/models");

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

const PRODUCT_PROPERTIES = {
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
  expirationPeriod: {
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

exports.clearDataFromAModel = async Model => {
  const getDocsInModel = () => {
    return Model.find();
  };
  const documents = await getDocsInModel();
  for (let index = 0; index < documents.length; index++) {
    await Model.findByIdAndDelete(documents[index]._id);
  }

  const documentsAfterDeletion = await getDocsInModel();
  assert.equal(
    documentsAfterDeletion.length,
    0,
    "the model contains some data"
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

exports.deleteUserById = userId => {
  return User.findByIdAndDelete(userId);
};

exports.deleteAllProducts = async products => {
  for (let index = 0; index < products.length; index++) {
    await Product.findByIdAndDelete(products[index].id);
  }
  const productCount = await Product.find().countDocuments();
  assert.equal(productCount, 0, "deletion not complete");
};

exports.createTestProducts = async (adminId, quantity = TRIALS) => {
  const products = [];
  let product;
  for (let index = 0; index < quantity; index++) {
    product = getRandomProductData(adminId);
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

const getRandomProductData = adminId => {
  const data = {};
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
