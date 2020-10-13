const bcrypt = require("bcrypt");
const {User, Admin, Product} = require("../../database/models");

const Models = require("../../database/models");

exports.clearTheDb = async () => {
  try {
    for (const ModelName in Models) {
      const Model = Models[ModelName];
      let count = await Model.find();
      count = count.length;
      if (count > 0) {
        await this.clearDataFromAModel(Model);
      }
    }
  } catch (error) {
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
  const documents = await Model.find();
  documents.forEach(async document => {
    await Model.findByIdAndDelete(document.id);
  });
};

exports.createNewAdmin = async () => {
  let admin = new Admin({
    name: "Samuel Maina",
    email: "samuelmayna@gmail.com",
    password: "Smainachez88(??",
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
    password: "Smainachez88(??",
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
  products = [];
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
