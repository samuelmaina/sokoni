const mongoose = require("mongoose");

const {product, mongooseId} = require("../../config/constraints");
const ranges = product;
const {ProductService} = require("../services");
const {findCategoriesPresent, calculateSellingPrice} = ProductService;
const {
  ensureStringIsNonEmpty,
  ensureIsMongooseId,
  ensureIsPositiveInt,
  ensureIsNonEmptyObject,
  ensureValueIsWithinRange,
  ensureIsInt,
} = require("./utils");

const {PRODUCTS_PER_PAGE} = require("../../config/env");

const POSITIVE_QUNTITY_QUERY = {quantity: {$gt: 0}};

const Schema = mongoose.Schema;

const Product = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: ranges.title.minlength,
      maxlength: ranges.title.maxlength,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      minlength: ranges.imageUrl.minlength,
      maxlength: ranges.imageUrl.maxlength,
    },
    buyingPrice: {
      type: Number,
      required: true,
      min: ranges.buyingPrice.min,
      max: ranges.buyingPrice.max,
    },
    percentageProfit: {
      type: Number,
      required: true,
      min: ranges.percentageProfit.min,
      max: ranges.percentageProfit.max,
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
      minlength: ranges.description.minlength,
      maxlength: ranges.description.maxlength,
    },
    quantity: {
      type: Number,
      required: true,
      min: ranges.quantity.min,
      max: ranges.quantity.max,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      minlength: mongooseId,
      maxlength: mongooseId,
    },
    category: {
      type: String,
      minlength: ranges.category.minlength,
      maxlength: ranges.category.maxlength,
      required: true,
    },
    brand: {
      type: String,
      minlength: ranges.brand.minlength,
      maxlength: ranges.brand.maxlength,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const {statics, methods} = Product;

statics.createOne = async function (productData) {
  ensureIsNonEmptyObject(productData);
  calculateSellingPrice(productData);
  const product = new this(productData);
  return await product.save();
};

statics.findProductsForPage = async function (page = 1) {
  validatePage(page);

  const products = await this.getProductsPerPage(page);
  const paginationData = await this.calculatePaginationData(page);
  return {
    paginationData,
    products,
  };
};

function validatePage(page) {
  const lowerlimit = 1;
  const upperlimit = 200;
  const err = `Page should range from ${lowerlimit} to ${upperlimit}`;
  ensureIsInt(page, err);
  ensureValueIsWithinRange(page, lowerlimit, upperlimit, err);
}

statics.findCategories = async function () {
  const products = await this.find();
  if (products.length < 1) return null;
  return findCategoriesPresent(products);
};

statics.findCategoryProductsForPage = async function (query) {
  const {category, page} = query;
  validatePage(page);
  const length = category.length;

  const lowerlimit = 5;
  const upperlimit = 200;
  const err = `Category should be ${lowerlimit} to ${upperlimit} characters long.`;
  ensureValueIsWithinRange(length, lowerlimit, upperlimit, err);
  const categoryQuery = {category};
  const paginationData = await this.calculatePaginationData(
    page,
    categoryQuery
  );
  const products = await this.getProductsPerPageForQuery(page, categoryQuery);
  if (products.length < 1) return null;
  return {
    products,
    paginationData,
  };
};
statics.findPageProductsForAdminId = async function (adminId, page) {
  ensureIsMongooseId(adminId);
  ensureIsPositiveInt(page);
  const query = {adminId};
  const paginationData = await this.calculatePaginationData(page, query);
  const products = await this.getProductsPerPageForQuery(page, query);
  return {
    paginationData,
    products,
  };
};

methods.isCreatedByAdminId = function (adminId) {
  ensureIsMongooseId(adminId);
  return this.adminId.toString() === adminId.toString();
};
methods.incrementQuantity = async function (quantity) {
  ensureIsPositiveInt(quantity);
  this.quantity += quantity;
  return await this.save();
};
methods.decrementQuantity = async function (quantity) {
  ensureIsPositiveInt(quantity);
  let currentQuantity = this.quantity;
  if (currentQuantity < quantity)
    throw new Error("No Enough Money to decrement.");
  currentQuantity -= quantity;
  this.quantity = currentQuantity;
  return await this.save();
};

methods.updateDetails = async function (productData) {
  ensureIsNonEmptyObject(productData);
  if (this.imageUrl !== productData.imageUrl) {
    fileManipulators.deleteFile(this.imageUrl);
  }
  ProductService.calculateSellingPrice(productData);
  for (const property in productData) {
    this[property] = productData[property];
  }
  return await this.save();
};
methods.delete = async function () {
  await this.deleteOne();
};

//static helpers.
statics.getProductsPerPage = async function (page) {
  return await this.getProductsPerPageForQuery(page, POSITIVE_QUNTITY_QUERY);
};

statics.NoOfProductsMeetingQuery = async function (query) {
  //the products fetched must have a positive quantity.So merge
  // POSITIVE_QUNTITY_QUERY with the query.
  for (const property in POSITIVE_QUNTITY_QUERY) {
    query[property] = POSITIVE_QUNTITY_QUERY[property];
  }
  return await this.find(query).countDocuments();
};

statics.calculatePaginationData = async function (page, query = {}) {
  const total = await this.NoOfProductsMeetingQuery(query);
  return ProductService.calculatePaginationData(page, total);
};

statics.getProductsPerPageForQuery = async function (page, query) {
  return await this.find(query)
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
};

module.exports = mongoose.model("Product", Product);
