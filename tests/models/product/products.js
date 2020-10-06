require("dotenv").config();

const {verifyTruthy} = require("../../utils/testUtils");

const {Product} = require("../../../database/models/index");

const {getRandomProductData} = require("../../utils/generalUtils");

const PRODUCTS_PER_PAGE = Number(process.env.PRODUCTS_PER_PAGE);

let TRIALS;

let products = [];
let adminId;

exports.setTRIAL = (trials) => {
  TRIALS = trials;
};

exports.setProducts = (prods = []) => {
  products = prods;
};

exports.setAdminId = (anAdminId) => {
  adminId = anAdminId;
};

//we can not user the global admin since we will create products with
//different adminIds for testing purposes.
exports.createNewProduct = async (adminId) => {
  const productData = getRandomProductData(adminId);
  let product = new Product(productData);
  await product.save();
  return product;
};

exports.hasWellCalculatedSellingPrice = (product) => {
  let {sellingPrice, buyingPrice, percentageProfit} = product;
  if (sellingPrice) {
    //check that the difference is less than 0.01 since === won't work for some values
    if ((1 + percentageProfit / 100) * buyingPrice - sellingPrice < 0.01) return true;
  }
  return false;
};

exports.feedProductsWithTestCategories = async (categories = []) => {
  if (TRIALS < 10) {
    throw new Error("can not run this tests");
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
  return {
    title: ` test ${Math.floor(Math.random() * 100)}`.trim(),
    buyingPrice: Math.floor(Math.random() * 100) + 2,
    percentageProfit: Math.floor(Math.random() * 100) + 2,
    expirationPeriod: Math.floor(Math.random() * 100) + 2,
    description: `the first user test at  ${Math.floor(Math.random() * 100)} `.trim(),
    adminId,
    category: `category ${Math.floor(Math.random() * 100)}`.trim(),
    brand: `brand ${Math.floor(Math.random() * 100)}`.trim(),
  };
};

exports.ensureThatTheRenderProductsAreWithinMAX_PRODUCT_PER_PAGE = (
  renderedProducts = []
) => {
  verifyTruthy(renderedProducts.length <= PRODUCTS_PER_PAGE);
};

exports.ensureAllRenderedProductsHavePositiveQuantity = (renderedProducts = []) => {
  renderedProducts.forEach((product) => {
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

exports.getRandomProductDataWithoutADataItem = (dataItemToMiss) => {
  const title = ` test ${Math.floor(Math.random() * 100)}`.trim();
  const imageUrl = `to/some/image${Math.floor(Math.random() * 100)}`;
  const buyingPrice = Math.floor(Math.random() * 100) + 2;
  const percentageProfit = Math.floor(Math.random() * 100) + 2;
  const expirationPeriod = Math.floor(Math.random() * 100) + 2;
  const description = `the first user test at  ${Math.floor(
    Math.random() * 100
  )} `.trim();
  const quantity = Math.ceil(Math.random() * 100) + 2;
  const category = `category ${Math.floor(Math.random() * 100)}`.trim();
  const brand = `brand ${Math.floor(Math.random() * 100)}`.trim();
  const data = [
    {title},
    {imageUrl},
    {buyingPrice},
    {percentageProfit},
    {expirationPeriod},
    {description},
    {quantity},
    {adminId},
    {category},
    {brand},
  ];
  data.keys();
  return data.filter((item) => {
    for (const key in item) {
      return key !== dataItemToMiss;
    }
  });
};
