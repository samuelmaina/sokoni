const {throws} = require("assert");
require("dotenv").config();

const {
  getRandomProductData,
  createTestProducts,
  createNewAdmin,
  deleteAdminById,
  deleteAllProducts,
  clearDataFromAModel,
} = require("../../utils/generalUtils");
const {verifyTruthy} = require("../../utils/testUtils");
const {Product} = require("../../../database/models/index");

const PRODUCTS_PER_PAGE = Number(process.env.PRODUCTS_PER_PAGE);
const ADMIN_ID = "Id47857dvv4rfdef888";
const TRIALS = 100;

let products = [];

//we can not user the global admin since we will create products with
//different adminIds for testing purposes.
exports.createNewProduct = async adminId => {
  const productData = this.getRandomProductData(adminId);
  let product = new Product(productData);
  await product.save();
  return product;
};

exports.hasWellCalculatedSellingPrice = product => {
  let {sellingPrice, buyingPrice, percentageProfit} = product;
  if (sellingPrice) {
    //check that the difference is less than 0.01 since === won't work for some values
    if ((1 + percentageProfit / 100) * buyingPrice - sellingPrice < 0.01)
      return true;
  }
  return false;
};

exports.feedProductsWithTestCategories = async (categories = []) => {
  if (TRIALS < 10) {
    throw new Error("can not run this test");
  }
  for (let i = 0; i < 4; i++) {
    products[i].category = categories[0];
    await products[i].save();
  }
  for (let i = 4; i < 8; i++) {
    products[i].category = categories[1];
    await products[i].save();
  }
  for (let i = 8; i < TRIALS; i++) {
    products[i].category = categories[2];
    await products[i].save();
  }
};

exports.getRandomProductDataWithNoImageUrl = () => {
  return this.getRandomProductDataWithoutADataItem("imageUrl");
};

exports.ensureThatTheRenderProductsAreWithinMAX_PRODUCT_PER_PAGE = (
  renderedProducts = []
) => {
  verifyTruthy(renderedProducts.length <= PRODUCTS_PER_PAGE);
};

exports.ensureAllRenderedProductsHavePositiveQuantity = (
  renderedProducts = []
) => {
  renderedProducts.forEach(product => {
    verifyTruthy(product.quantity > 0);
  });
};

exports.testProductUpdation = async (testProduct, testProductData) => {
  let copyOfProductData = {...testProductData};
  await testProduct.updateDetails(testProductData);
  for (const key in copyOfProductData) {
    if (copyOfProductData.hasOwnProperty(key))
      expect(copyOfProductData[key]).toEqual(testProductData[key]);
  }
  expect(this.hasWellCalculatedSellingPrice(testProduct)).toBeTruthy();
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
exports.verifyErrorsAreThrownWhenProductDataMisses = () => {
  let message;
  for (const prop in PRODUCT_PROPERTIES) {
    message = `${prop} is expected`;
    const trial = this.getRandomProductDataWithoutADataItem(prop);
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

exports.getRandomProductDataWithoutADataItem = dataItemToMiss => {
  const data = this.getRandomProductData(adminId);
  const appropriateData = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key !== dataItemToMiss) appropriateData[key] = data[key];
    }
  }
  return appropriateData;
};
