const mongoose = require("mongoose");

const {ensureIsMongooseId} = require("../models/utils");
const {PRODUCTS_PER_PAGE} = require("../../config");

const ranges = {
  title: [5, 20],
  imageUrl: [5, 20],
  buyingPrice: [1, 100000],
  percentageProfit: [0, 100],
  description: [10, 40],
  quantity: [0, 2000],
  category: [5, 20],
  brand: [5, 20],
};

const Schema = mongoose.Schema;

const productSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: ranges.title[0],
    maxlength: ranges.title[1],
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
    minlength: ranges.imageUrl[0],
    maxlength: ranges.imageUrl[1],
  },
  buyingPrice: {
    type: Number,
    required: true,
    min: ranges.buyingPrice[0],
    max: ranges.buyingPrice[1],
  },
  percentageProfit: {
    type: Number,
    required: true,
    min: ranges.percentageProfit[0],
    max: ranges.percentageProfit[1],
  },
  //this one is always calculated by
  //the server so no need
  //to specify it in the schema.
  sellingPrice: {
    type: Number,
  },

  description: {
    type: String,
    required: true,
    trim: true,
    minlength: ranges.description[0],
    maxlength: ranges.description[1],
  },
  quantity: {
    type: Number,
    required: true,
    min: ranges.quantity[0],
    max: ranges.quantity[1],
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  category: {
    type: String,
    minlength: ranges.category[0],
    maxlength: ranges.category[1],
    required: true,
  },
  brand: {
    type: String,
    minlength: ranges.brand[0],
    maxlength: ranges.brand[1],
    required: true,
  },
};

exports.productSchema = productSchema;

exports.calculateSellingPrice = productData => {
  productData.sellingPrice = (
    (1 + productData.percentageProfit / 100.0) *
    productData.buyingPrice
  ).toFixed(2);
};

exports.ensureAllProductPropArePresent = data => {
  //check if all the properties are there.
  for (const key in productSchema) {
    if (productSchema.hasOwnProperty(key)) {
      if (key === "sellingPrice") {
        continue;
      }
      if (!data[key]) {
        throw new Error(`${key} is expected.`);
      }
      const fieldData = data[key];
      if (key === "adminId") {
        ensureIsMongooseId(fieldData);
        continue;
      }
      const lowerLimit = ranges[key][0];
      const upperLimit = ranges[key][1];
      const errorMessage = `Invalid ${key}`;
      const fieldType = typeof fieldData;
      if (fieldType === "string") {
        const stringLength = fieldData.length;
        if (!isValueInRange(stringLength, lowerLimit, upperLimit)) {
          throw new Error(errorMessage);
        }
        continue;
      }
      if (fieldType === "number") {
        if (!isValueInRange(fieldData, lowerLimit, upperLimit)) {
          throw new Error(errorMessage);
        }
        continue;
      }
    }
  }
};

exports.calculatePaginationData = (page, total) => {
  return {
    hasNextPage: page * PRODUCTS_PER_PAGE < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
};
exports.findCategoriesPresent = products => {
  let categories = [];
  for (const product of products) {
    let prodCategory = product.category;
    const categoryIndex = categories.findIndex(c => {
      return c === prodCategory;
    });
    if (categoryIndex < 0) {
      categories.push(prodCategory);
    }
  }
  return categories;
};
const isValueInRange = (value, lowerLimit, upperLimit) => {
  return value >= lowerLimit && value <= upperLimit;
};
