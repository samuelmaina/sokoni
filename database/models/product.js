const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const imageDeleter = require("../../util/deletefile");

const PRODUCTS_PER_PAGE = parseInt(process.env.PRODUCTS_PER_PAGE);
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

const quantityGreaterThanZero = { quantity: { $gt: 0 } };

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
  productData.sellingPrice = (
    (1 + productData.percentageProfit / 100.0) *
    productData.buyingPrice
  ).toFixed(2);

  const product = new this(productData);
  return product.save();
};

Product.statics.getTotalNumberOfProducts = function (criterion = {}) {
  for (const key in criterion) {
    if (criterion.hasOwnProperty(key)) {
      if (!productSchema[key]) {
        throw new Error("can not query a non-existent property");
      }
    }
  }
  for (const property in quantityGreaterThanZero) {
    criterion[property] = quantityGreaterThanZero[property];
  }
  return this.find(criterion).countDocuments();
};

const calculatePaginationData = (total, page) => {
  const paginationData = {
    hasNextPage: page * PRODUCTS_PER_PAGE < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
  return paginationData;
};
Product.statics.getProductsWhoseQuantityIsGreaterThanZero = async function (
  page = 1
) {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("page must be a positive whole number");
  }
  const total = await this.getTotalNumberOfProducts();
  const paginationData = calculatePaginationData(total, page);

  //TODO: Add a  way to discard expired products
  const products = await this.find(quantityGreaterThanZero)
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
  return {
    paginationData,
    products,
  };
};

Product.statics.findPageProductsForAdminId = async function (adminId, page) {
  const total = await this.getTotalAdminProducts(adminId);
  const paginationData = calculatePaginationData(total, page);
  const products = await this.find({ adminId })
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
  return {
    paginationData,
    products,
  };
};

Product.statics.getPresentCategories = async function () {
  let categories = [];
  const products = await this.find(quantityGreaterThanZero).exec();
  for (const product of products) {
    let prodCategory = product.category;
    const categoryIndex = categories.findIndex((c) => {
      return c === prodCategory;
    });
    if (categoryIndex < 0) {
      categories.push(prodCategory);
    }
  }
  return categories;
};

Product.statics.findCategoryProducts = async function (category, page = 1) {
  const categoryQuery = { category };
  const total = await this.getTotalNumberOfProducts(categoryQuery);
  const paginationData = calculatePaginationData(total, page);
  const products = await this.find({ category })
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
  return {
    products,
    paginationData,
  };
};
Product.statics.deleteById = function (prodId) {
  return this.findByIdAndDelete(prodId);
};
Product.statics.getTotalAdminProducts = function (adminId) {
  return this.find({ adminId }).countDocuments();
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
  let image = productData.imageUrl;

  if (image) {
    const imagePath = path.resolve(this.imageUrl);
    fs.exists(imagePath, (exists) => {
      if (exists) {
        imageDeleter(imagePath);
      }
    });
    this.imageUrl = image.path;
  }
  productData.sellingPrice = (
    (1 + productData.percentageProfit / 100.0) *
    productData.buyingPrice
  ).toFixed(2);
  for (const property in productData) {
    this[property] = productData[property];
  }
  return this.save();
};
module.exports = mongoose.model("Product", Product);
