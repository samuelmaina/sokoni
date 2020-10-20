const {throws} = require("assert");
const {PRODUCTS_PER_PAGE} = require("../../../config");

const {verifyTruthy} = require("../../utils/testsUtils");
const {Product} = require("../../../database/models");

const {
  PRODUCT_PROPERTIES,
  getRandomProductData,
} = require("../../utils/generalUtils");

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
      "Some products will not be assigned categories which may affect testing."
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

exports.verifyErrorIsThrownWhenAnyProductDataMisses = adminId => {
  let message;
  for (const prop in PRODUCT_PROPERTIES) {
    message = `${prop} is expected`;
    const trial = this.getRandomProductDataWithoutADataItem(prop, adminId);
    throws(
      () => {
        Product.createNew(trial).catch(err => {
          throw new Error(err);
        });
      },
      {message}
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
