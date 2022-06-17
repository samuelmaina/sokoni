const path = require("path");

const requires = require("../requires");

const { unlink, readdir } = require("fs");

const ObjectId = require("mongoose").Types.ObjectId;
const { product } = requires.constrains;

const { Product } = requires.Models;

const { cloudUploader } = requires.utils;

exports.generateStringSizeN = function (N) {
  let string = "";
  const character = "s";
  for (let i = 1; i <= N; i++) {
    if (i % 2 === 0) {
      string += `${Math.floor(Math.random() * 10)}`;
    } else {
      string += character;
    }
  }
  return string;
};

exports.returnObjectWithoutProp = function (obj, key) {
  const result = {};
  for (const prop in obj) {
    if (prop === key) {
      continue;
    }
    result[prop] = obj[prop];
  }
  return result;
};

exports.generateRandomIntInRange = (min, max) => {
  return Math.floor(this.generateRandomFloatInRange(min, max));
};
exports.generateRandomFloatInRange = function (min, max) {
  return min + Math.random() * (max - min);
};

exports.generateMongooseId = () => {
  return new ObjectId().toString();
};

exports.generateRandomMongooseIds = (quantity) => {
  const Ids = [];
  for (let i = 0; i < quantity; i++) {
    Ids.push(this.generateMongooseId());
  }
  return Ids;
};

exports.generatePerfectProductData = () => {
  const prodRanges = product;

  const generated = {};
  generated.title = this.generateStringSizeN(prodRanges.title.minlength);
  generated.imageUrl = this.generateStringSizeN(prodRanges.imageUrl.minlength);

  generated.public_id = this.generateStringSizeN(prodRanges.imageUrl.minlength);

  generated.buyingPrice = this.generateRandomFloatInRange(
    prodRanges.buyingPrice.min,
    prodRanges.buyingPrice.max
  );
  generated.percentageProfit = this.generateRandomFloatInRange(
    prodRanges.percentageProfit.min,
    prodRanges.percentageProfit.max
  );
  generated.description = this.generateStringSizeN(
    prodRanges.description.minlength
  );
  generated.quantity = this.generateRandomIntInRange(
    prodRanges.quantity.min,
    prodRanges.quantity.max
  );
  generated.adminId = this.generateMongooseId();
  generated.category = this.generateStringSizeN(prodRanges.category.minlength);
  generated.brand = this.generateStringSizeN(prodRanges.brand.minlength);
  return generated;
};

exports.generateRandomProductData = (adminId) => {
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
      data[key] = Math.floor(Math.random() * 100) + 100;
    }
  }
  return data;
};

exports.deleteAllCreatedImages = async () => {
  const products = await Product.find();
  for (const product of products) {
    const public_id = product.public_id;
    if (public_id.length > 7) await cloudUploader.deleteFile(public_id);
  }
  const deleteAllImages = new Promise((resolve, reject) => {
    const pathString = path.resolve("data", "testFolder");
    readdir(pathString, (err, files) => {
      if (err) return reject(err);
      for (const file of files) {
        unlink(path.join(pathString, file), (err) => {
          if (err) return reject(err);
        });
      }
    });
    resolve();
  });

  await deleteAllImages;
};

exports.PRODUCT_PROPERTIES = {
  title: { type: String },
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
