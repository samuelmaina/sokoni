const mongoose = require("mongoose");

const { product } = require("../../config/constraints");

const { productServices } = require("../services");
const { calculateSellingPrice, calculatePaginationData } = productServices;
const { ensureIsPositiveInt } = require("./utils");

const { PRODUCTS_PER_PAGE } = require("../../config/env");
const { fileManipulators, cloudUploader } = require("../../utils");
const { formatFloat, formatInt } = require("../../utils/formatters");

const POSITIVE_QUNTITY_QUERY = { quantity: { $gt: 0 } };

const Schema = mongoose.Schema;

const Product = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    public_id: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    buyingPrice: {
      type: Number,
      required: true,
      min: 100,
      max: 2000000,
    },
    percentageProfit: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
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
      minlength: 10,
      maxlength: 4000,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      max: 2000000,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      minlength: 24,
      maxlength: 24,
    },
    category: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
    },
    brand: {
      type: String,
      minlength: 1,
      maxlength: 255,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const { statics, methods } = Product;

statics.createOne = async function (productData) {
  calculateSellingPrice(productData);
  const metadata = await getMetadata();
  const { category, brand, adminId } = productData;
  const Product = mongoose.model("Product");
  const product = new Product(productData);
  await product.save();
  await metadata.addCategory({
    category,
    adminId,
  });
  await metadata.addBrand({
    brand,
    adminId,
  });
  return product;
};

statics.findPageProductsForAdminId = async function (adminId, page) {
  const query = { adminId };
  const products = await this.getProductsPerPageForQuery(page, query);
  const paginationData = await this.calculatePaginationData(page, query);
  if (products.length < 1) return null;
  return {
    paginationData,
    products,
  };
};

statics.findProductsForPage = async function (page) {
  ensureIsPositiveInt(page, "Page must be a positive int.");
  const products = await this.getProductsPerPage(page);
  const paginationData = await this.calculatePaginationData(page);
  if (products.length === 0) return null;
  return {
    paginationData,
    products,
  };
};

statics.findCategories = async function () {
  const metadata = await getMetadata();
  return metadata.getAllCategories();
};
statics.findCategoriesForAdminId = async function (adminId) {
  const metadata = await getMetadata();
  return metadata.getAllCategoriesForAdminId(adminId.toString());
};

statics.findCategoryProductsForAdminIdAndPage = async function (
  adminId,
  category,
  page
) {
  const query = { adminId, category };
  const paginationData = await this.calculatePaginationData(page, query);
  const products = await this.getProductsPerPageForQuery(page, query);

  if (products.length === 0) {
    const metadata = await getMetadata();
    await metadata.removeAdminIdFromCategory(category, adminId);
    return null;
  }
  return {
    paginationData,
    products,
  };
};

statics.findCategoryProductsForPage = async function (category, page) {
  const categoryQuery = { category };
  const products = await this.getProductsPerPageForQuery(page, categoryQuery);
  const paginationData = await this.calculatePaginationData(
    page,
    categoryQuery
  );
  if (products.length === 0) {
    return null;
  }
  return {
    products,
    paginationData,
  };
};

methods.isCreatedByAdminId = function (adminId) {
  return this.adminId.toString() === adminId.toString();
};
methods.incrementQuantity = async function (quantity) {
  this.quantity += quantity;
  return await this.save();
};
methods.decrementQuantity = async function (quantity) {
  const howMany = Number(quantity);
  let currentQuantity = this.quantity;
  if (currentQuantity < howMany)
    throw new Error("Can decrement such decrement.");
  currentQuantity -= howMany;
  this.quantity = currentQuantity;
  return await this.save();
};

methods.updateDetails = async function (productData) {
  if (this.imageUrl !== productData.imageUrl) {
    fileManipulators.deleteFile(this.imageUrl);
  }
  const adminId = this.adminId;
  const metadata = await getMetadata();
  const previousCategory = this.category;
  calculateSellingPrice(productData);
  for (const property in productData) {
    this[property] = productData[property];
  }

  const { brand, category } = productData;
  if (this.category !== previousCategory) {
    await metadata.addCategory({
      category,
      adminId,
    });
    await metadata.addBrand({
      brand,
      adminId,
    });
  }
  return await this.save();
};
methods.customDelete = async function () {
  await cloudUploader.deleteFile(this.imageUrl);
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
  return calculatePaginationData(page, total);
};

statics.getProductsPerPageForQuery = async function (page, query) {
  const results = [];
  const products = await this.find(query)
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);

  products.forEach((product) => {
    const prod = { ...product._doc };
    prod.sellingPrice = formatFloat(product.sellingPrice);
    prod.buyingPrice = formatFloat(product.buyingPrice);
    prod.quantity = formatInt(product.quantity, ",");
    results.push(prod);
  });
  return results;
};

async function getMetadata() {
  const Metadata = mongoose.model("Metadata");
  return await Metadata.getSingleton();
}

module.exports = mongoose.model("Product", Product);
