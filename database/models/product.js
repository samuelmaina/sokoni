const mongoose = require("mongoose");

const {ProductService} = require("../services");

const {fileManipulators} = require("../../utils");

let {PRODUCTS_PER_PAGE} = require("../../config");

const POSITIVE_QUNTITY_QUERY = {quantity: {$gt: 0}};

const Schema = mongoose.Schema;

const productSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  buyingPrice: {
    type: Number,
    required: true,
  },
  percentageProfit: {
    type: Number,
    min: 0,
  },
  sellingPrice: {
    type: Number,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
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

Product.statics.createOne = function (productData) {
  //check if all the properties are there.
  for (const key in productSchema) {
    if (productSchema.hasOwnProperty(key)) {
      if (key === "sellingPrice") {
        continue;
      }
      if (!productData[key]) {
        throw new Error(`${key} is expected`);
      }
    }
  }
  ProductService.calculateSellingPrice(productData);
  const product = new this(productData);
  return product.save();
};

Product.statics.findProductsForPage = async function (page = 1) {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be a positive whole number");
  }
  const paginationData = await this.calculatePaginationData(page);
  const products = await this.getProductsPerPage(page);
  return {
    paginationData,
    products,
  };
};

Product.statics.findCategories = async function () {
  const products = await this.find(POSITIVE_QUNTITY_QUERY);
  return ProductService.findCategoriesPresent(products);
};

Product.statics.findCategoryProductsForPage = async function (
  category,
  page = 1
) {
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

Product.statics.findPageProductsForAdminId = async function (adminId, page) {
  const query = {adminId};
  const paginationData = await this.calculatePaginationData(page, query);
  const products = await this.getProductsPerPageForQuery(page, query);
  return {
    paginationData,
    products,
  };
};

Product.methods.isCreatedByAdminId = function (adminId) {
  return this.adminId.toString() === adminId.toString();
};
Product.methods.incrementQuantity = async function (quantity) {
  if (quantity < 1) {
    throw new Error("can not increase a quantity less than 1");
  }
  this.quantity += quantity;
  return await this.save();
};
Product.methods.decrementQuantity = async function (quantity) {
  let currentQuantity = this.quantity;
  if (currentQuantity < quantity)
    throw new Error("can not reduce such a quantity");
  currentQuantity -= quantity;
  this.quantity = currentQuantity;
  return await this.save();
};

Product.methods.updateDetails = async function (productData) {
  if (this.imageUrl !== productData.imageUrl) {
    fileManipulators.deleteFile(this.imageUrl);
  }
  ProductService.calculateSellingPrice(productData);
  for (const property in productData) {
    this[property] = productData[property];
  }
  return await this.save();
};
Product.methods.deleteProduct = async function () {
  await this.deleteOne();
};

Product.statics.getProductsPerPage = async function (page) {
  return await this.getProductsPerPageForQuery(page, POSITIVE_QUNTITY_QUERY);
};

Product.statics.totalOfProductsMeetingQuery = async function (query) {
  //the products fetched must have a positive quantity.So merge
  // POSITIVE_QUNTITY_QUERY with the query.
  for (const property in POSITIVE_QUNTITY_QUERY) {
    query[property] = POSITIVE_QUNTITY_QUERY[property];
  }
  return await this.find(query).countDocuments();
};

Product.statics.calculatePaginationData = async function (page, query = {}) {
  const total = await this.totalOfProductsMeetingQuery(query);
  return ProductService.calculatePaginationData(page, total);
};

Product.statics.getProductsPerPageForQuery = async function (page, query) {
  return await this.find(query)
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
};
module.exports = mongoose.model("Product", Product);
