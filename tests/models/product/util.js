const {PRODUCTS_PER_PAGE} = require("../../../config");

const {
  verifyTruthy,
  verifyEqual,
  verifyIDsAreEqual,
} = require("../../utils/testsUtils");
const {Product} = require("../../../database/models");

const {
  PRODUCT_PROPERTIES,
  getRandomProductData,
} = require("../../utils/generalUtils");

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
exports.hasWellCalculatedSellingPrice = product => {
  let {sellingPrice, buyingPrice, percentageProfit} = product;
  if (sellingPrice) {
    //check that the difference is less than 0.01 since === won't work for some values
    if (
      Math.abs((1 + percentageProfit / 100) * buyingPrice - sellingPrice) < 0.01
    )
      return true;
  }
  return false;
};

exports.feedProductsWithTestCategories = async (
  products = [],
  categories = []
) => {
  const TRIALS = products.length;
  const noOfCategories = categories.length;
  if (noOfCategories > TRIALS) {
    throw new Error(
      "Some categories will miss products.This may lead to faulty tests."
    );
  }
  let categoryIndex;
  for (let i = 0; i < TRIALS; i++) {
    categoryIndex = i % noOfCategories;
    products[i].category = categories[categoryIndex];
    await products[i].save();
  }
};

exports.getRandomProductDataWithNoImageUrl = adminId => {
  return this.getRandomProductDataWithoutADataItem("imageUrl", adminId);
};

exports.verifyProductHasProperties = (product, properties) => {
  for (const key in properties) {
    //Ids require special comparison.
    if (key == "adminId") {
      verifyIDsAreEqual(properties[key], properties[key]);
      continue;
    }
    //sellingPrice is verified on its own.
    if (key === "sellingPrice") continue;
    verifyEqual(properties[key], product[key]);
  }
  verifyTruthy(this.hasWellCalculatedSellingPrice(product));
};
exports.ensureNoOfProductsAreWithinPRODUCTS_PER_PAGE = (products = []) => {
  verifyTruthy(products.length <= PRODUCTS_PER_PAGE);
};

exports.ensureProductsHavePositiveQuantity = (products = []) => {
  products.forEach(product => {
    verifyTruthy(product.quantity > 0);
  });
};

exports.calculatePaginationData = async (page, query = {}) => {
  const total = await totalProductsForQuery(query);
  return {
    hasNextPage: page * PRODUCTS_PER_PAGE < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
};
const totalProductsForQuery = async (query = {}) => {
  return await Product.find(query).countDocuments();
};

exports.verifyErrorIsThrownWhenAnyProductDataMissesOrIsOutOfRange = async adminId => {
  for (const dataItem in PRODUCT_PROPERTIES) {
    let ifInvalidErrorMessage = `Invalid ${dataItem}`;
    let ifMissingErrorMessage = `${dataItem} is expected.`;
    let trial = this.getRandomProductDataWithoutADataItem(dataItem, adminId);
    await expect(Product.createOne(trial)).rejects.toThrow(
      ifMissingErrorMessage
    );
    trial = this.getRandomProductDataWithInValidDataItem(dataItem, adminId);
    if (dataItem === "adminId") {
      ifInvalidErrorMessage = "Invalid mongoose Id.";
    }
    await expect(Product.createOne(trial)).rejects.toThrow(
      ifInvalidErrorMessage
    );
  }
};

exports.getRandomProductDataWithoutADataItem = (dataItemToMiss, adminId) => {
  const data = getRandomProductData(adminId);
  const appropriateData = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key !== dataItemToMiss) appropriateData[key] = data[key];
    }
  }
  return appropriateData;
};
exports.getRandomProductDataWithInValidDataItem = (dataItemToMiss, adminId) => {
  const data = getRandomProductData(adminId);
  const appropriateData = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === dataItemToMiss) {
        const typeOfgeneratedData = typeof data[key];
        if (typeOfgeneratedData === "string") {
          let upperLimitLength = ranges[key][1];
          appropriateData[key] = generateNlongString(upperLimitLength + 10);
        }
        if (typeOfgeneratedData === "number") {
          let upperLimit = ranges[key][1];
          appropriateData[key] = upperLimit + 20;
        }
        if (key === "adminId") {
          appropriateData[key] = `Idrueiujfkdjfk784${Math.floor(
            Math.random() * 2000
          )}`;
        }

        continue;
      }
    }
    appropriateData[key] = data[key];
  }
  return appropriateData;
};

const generateNlongString = N => {
  const character = "s";
  let string = "";
  for (let i = 0; i < N; i++) {
    string += character;
  }
  return string;
};

exports.fetchAdminIdsFromAdmins = admins => {
  const ids = [];
  for (const admin of admins) {
    ids.push(admin.id);
  }
  return ids;
};
