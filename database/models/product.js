const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const {ProductService} = require("../services");
const imageDeleter = require("../../util/deleteFile");
const Schema = mongoose.Schema;
const PRODUCTS_PER_PAGE = Number(process.env.PRODUCTS_PER_PAGE);

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
  expirationPeriod: {
    type: Number,
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
    type: String,
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

const quantityGreaterThanZero = {quantity: {$gt: 0}};

Product.statics.getProductsPerPageForQuery = async function (page, query) {
  return await this.find(query)
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
};

Product.statics.createNew = function (productData) {
  //check if all the properties are there.
  for (const key in productSchema) {
    if (productSchema.hasOwnProperty(key)) {
      if (key === "sellingPrice") continue;
      if (!productData[key]) {
        throw new Error(`${key} is expected`);
      }
    }
  }
  ProductService.calculateSellingPrice(productData);
  const product = new this(productData);
  return product.save();
};

Product.statics.getProductsWhoseQuantityIsGreaterThanZero = async function (
  page = 1
) {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("page must be a positive whole number");
  }
  const paginationData = await this.calculatePaginationData(page);
  const products = await this.getProductsPerPage(page);
  return {
    paginationData,
    products,
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

Product.statics.getPresentCategories = async function () {
  const products = await this.getAllProductsWhoseQuantityIsGreaterThanZero();
  return ProductService.findCategoriesPresent(products);
};

Product.statics.findCategoryProducts = async function (category, page = 1) {
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
Product.statics.deleteById = function (prodId) {
  return this.findByIdAndDelete(prodId);
};

Product.methods.isCreatedByAdminId = function (adminId) {
  return this.adminId.toString() === adminId.toString();
};
Product.methods.increaseQuantityBy = function (quantity) {
  if (quantity < 1) {
    throw new Error("can not increase a quantity less than 1");
  }
  this.quantity += quantity;
  return this.save();
};
Product.methods.reduceQuantityBy = async function (quantity) {
  let currentQuantity = this.quantity;
  if (currentQuantity < quantity)
    throw new Error("can not reduce such a quantity");
  currentQuantity -= quantity;
  this.quantity = currentQuantity;
  await this.save();
  return null;
};
Product.methods.getQuantity = function () {
  return this.quantity;
};
Product.methods.getSellingPrice = function () {
  return this.sellingPrice;
};

Product.methods.updateDetails = function (productData) {
  if (this.imageUrl !== productData.imageUrl) {
    const imagePath = path.resolve(this.imageUrl);
    fs.exists(imagePath, exists => {
      if (exists) {
        imageDeleter(imagePath);
      }
    });
  }
  ProductService.calculateSellingPrice(productData);
  for (const property in productData) {
    this[property] = productData[property];
  }
  return this.save();
};

Product.statics.getAllProductsWhoseQuantityIsGreaterThanZero = async function () {
  return await this.find(quantityGreaterThanZero);
};

Product.statics.getProductsPerPage = async function (page) {
  return await this.getProductsPerPageForQuery(page, quantityGreaterThanZero);
};

Product.statics.totalOfProductsMeetingQuery = async function (query) {
  //the products fetched must have a positive quantity.So merge
  // quantityGreaterThanZero with the query.
  for (const property in quantityGreaterThanZero) {
    query[property] = quantityGreaterThanZero[property];
  }
  return await this.find(query).countDocuments();
};

Product.statics.calculatePaginationData = async function (page, query = {}) {
  const total = await this.totalOfProductsMeetingQuery(query);
  return ProductService.calculatePaginationData(page, total);
};
module.exports = mongoose.model("Product", Product);
