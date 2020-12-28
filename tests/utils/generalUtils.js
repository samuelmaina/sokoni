const bcrypt = require("bcrypt");
const assert = require("assert");
const ObjectId = require("mongoose").Types.ObjectId;

const Models = require("../../database/models");

exports.generateMongooseId = () => {
  return ObjectId();
};
exports.ensureIsMongooseId = id => {
  const isId = ObjectId.isValid(id);
  if (!isId) {
    throw new Error("The Id is not valid.");
  }
  const castedId = new ObjectId(id);
  const isInValid = castedId !== id;
  if (isInValid) {
    throw new Error("Invalid Mongosse id.");
  }
};

exports.hashPassword = async password => {
  return await bcrypt.hash(password, 12);
};

exports.confirmPassword = async (password, hashePassword) => {
  return await bcrypt.compare(password, hashePassword);
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
        await this.clearDataFromModel(Model);
      }
      count = await getNoOfDocs();
      assert.equal(count, 0, "deletion not complete");
    }
  } catch (error) {
    throw new Error(error);
  }
};

exports.clearDataFromModel = async Model => {
  const noOfDocs = async () => {
    return await Model.countDocuments();
  };
  await Model.deleteMany();
  const countAfterDeletion = await noOfDocs();
  assert.equal(
    countAfterDeletion,
    0,
    `the model (${Model.modelName} not cleared completely.`
  );
};

const {User, Admin, Product} = Models;

exports.createNewAdmin = async () => {
  return await createNewDoc(Admin);
};

exports.createNewAdminWithData = async data => {
  return await createNewDocWithData(Admin, data);
};

exports.createTrialAdmins = async quantity => {
  return await this.createTrialDocuments(Admin, quantity);
};
exports.createNewUserWithData = async data => {
  return await createNewDocWithData(User, data);
};

exports.createNewUser = async () => {
  return await createNewDoc(User);
};

exports.generateRandomMongooseIds = quantity => {
  const Ids = [];
  for (let i = 0; i < quantity; i++) {
    Ids.push(this.generateMongooseId());
  }
  return Ids;
};

exports.createTestProducts = async (adminIDs = [], quantity = 1) => {
  ensureArrayIsNotEmptyNullOrUndefinded(adminIDs);
  ensureValueIsPositiveInt(quantity);
  const products = [];
  let product;
  const numberOfAdmins = adminIDs.length;
  for (let index = 0; index < quantity; index++) {
    const adminIndex = index % numberOfAdmins;
    const adminId = adminIDs[adminIndex];
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
  // this.ensureIsMongooseId(adminId);
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
    if (key === "percentageProfit") {
      data[key] = Math.floor(Math.random() * 100);
      continue;
    }
    if (PRODUCT_PROPERTIES[key].type === Number) {
      data[key] = Math.floor(Math.random() * 100) + 2;
    }
  }
  return data;
};

exports.createTrialDocuments = async (Model, TRIALS) => {
  const searchData = [];

  for (let index = 0; index < TRIALS; index++) {
    const randomPassword = `Smaihz${Math.ceil(
      Math.random() * 1000
    )}??8${Math.ceil(Math.random() * 1000)}`.trim();

    const name = `John Doe ${Math.floor(Math.random() * 10000)}`;
    const password = await this.hashPassword(randomPassword);
    const email = `johndoe${index}@gmail.com`.trim();

    let document = new Model({name, email, password});
    await document.save();

    const id = document.id;
    searchData.push({email, password: randomPassword, id});
  }
  return searchData;
};

const createNewDocWithData = async (Model, data) => {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const dataToSave = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === "password") continue;
      dataToSave[key] = data[key];
    }
  }
  dataToSave.password = hashedPassword;
  let document = new Model(dataToSave);
  document = await document.save();
  return document;
};
const createNewDoc = async Model => {
  let document = new Model({
    name: "Samuel Maina",
    email: "samuelmayna@gmail.com",
    password: await bcrypt.hash("Smainachez88(??", 12),
  });
  document = await document.save();
  return document;
};
exports.PRODUCT_PROPERTIES = {
  title: {type: String},
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
const ensureArrayIsNotEmptyNullOrUndefinded = array => {
  const isArray = Array.isArray(array);
  if (!isArray) {
    throw new Error("The values passed is not an array");
  }
  if (array.length < 1) {
    throw new Error("The array does not have any content");
  }
};

const ensureValueIsPositiveInt = value => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("Value not a positive integer.");
  }
};
