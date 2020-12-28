const mongoose = require("mongoose");

const {ProductService} = require("../services");
const {
  ensureIsMongooseId,
  ensureIsPositiveInt,
  ensureIsObject,
} = require("./utils");

const {fileManipulators} = require("../../utils");

let {PRODUCTS_PER_PAGE} = require("../../config");

const POSITIVE_QUNTITY_QUERY = {quantity: {$gt: 0}};

const Schema = mongoose.Schema;

const productSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    minlength: 5,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    minlength: 5,
  },
  buyingPrice: {
    type: Number,
    required: true,
    min: 1.0,
    max: 1000000,
  },
  percentageProfit: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
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
    maxlength: 40,
    minlength: 10,
  },
  quantity: {
    type: Number,
    required: true,
    max: 20000,
    min: 0,
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  category: {
    type: String,
    maxlength: 20,
    minlength: 3,
    required: true,
  },
  brand: {
    type: String,
    maxlength: 20,
    minlength: 3,
    required: true,
  },
};

const Product = new Schema(productSchema, {
  timestamps: true,
});
const {statics, methods} = Product;

statics.createOne = async function (productData) {
  ensureAllProductPropArePresent(productData);
  ProductService.calculateSellingPrice(productData);
  const product = new this(productData);
  return await product.save();
};

statics.findProductsForPage = async function (page = 1) {
  ensureIsPositiveInt(page);
  const paginationData = await this.calculatePaginationData(page);
  const products = await this.getProductsPerPage(page);
  return {
    paginationData,
    products,
  };
};

statics.findCategories = async function () {
  const products = await this.find(POSITIVE_QUNTITY_QUERY);
  return ProductService.findCategoriesPresent(products);
};

statics.findCategoryProductsForPage = async function (category, page = 1) {
  ensureIsPositiveInt(page);
  const categoryQuery = {category};
  const paginationData = await this.calculatePaginationData(
    page,
    categoryQuery
  );
  const products = await this.getProductsPerPageForQuery(page, categoryQuery);
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
    throw new Error("can not reduce such a quantity");
  currentQuantity -= quantity;
  this.quantity = currentQuantity;
  return await this.save();
};

methods.updateDetails = async function (productData) {
  ensureIsObject(productData);
  if (this.imageUrl !== productData.imageUrl) {
    fileManipulators.deleteFile(this.imageUrl);
  }
  ProductService.calculateSellingPrice(productData);
  for (const property in productData) {
    this[property] = productData[property];
  }
  return await this.save();
};
methods.deleteProduct = async function () {
  await this.deleteOne();
};

//static helpers.
statics.getProductsPerPage = async function (page) {
  return await this.getProductsPerPageForQuery(page, POSITIVE_QUNTITY_QUERY);
};

statics.totalOfProductsMeetingQuery = async function (query) {
  //the products fetched must have a positive quantity.So merge
  // POSITIVE_QUNTITY_QUERY with the query.
  for (const property in POSITIVE_QUNTITY_QUERY) {
    query[property] = POSITIVE_QUNTITY_QUERY[property];
  }
  return await this.find(query).countDocuments();
};

statics.calculatePaginationData = async function (page, query = {}) {
  const total = await this.totalOfProductsMeetingQuery(query);
  return ProductService.calculatePaginationData(page, total);
};

statics.getProductsPerPageForQuery = async function (page, query) {
  return await this.find(query)
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
};
const ensureAllProductPropArePresent = data => {
  //check if all the properties are there.
  for (const key in productSchema) {
    if (productSchema.hasOwnProperty(key)) {
      if (key === "sellingPrice") {
        continue;
      }
      if (!data[key]) {
        throw new Error(`${key} is expected`);
      }
    }
  }
};

module.exports = mongoose.model("Product", Product);
