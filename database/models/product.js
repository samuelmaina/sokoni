const mongoose = require("mongoose");

const imageDeleter=require('../../util/deletefile');

const PRODUCTS_PER_PAGE = 3;

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  buyingPrice: {
    type: Number,
    required: true
  },
  percentageProfit: {
    type: Number,
    min: 0
  },
  expirationPeriod: {
    type: Number
  },
  sellingPrice: {
    type: Number
  },

  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  adminId: {
    type: String,
    required: true
  },
  adminName: {
    type: String,
    required: true,
    trim: true
  },
  timestamp:{
    type:Date,
    default:Date.now()
  }
 
});


productSchema.statics.createNew = function(productData) {
  const product = new this({
    title: productData.title,
    imageUrl: productData.imageUrl,
    buyingPrice: productData.buyingPrice,
    percentageProfit: productData.percentageProfit,
    expirationPeriod: productData.expirationPeriod,
    description: productData.description,
    sellingPrice: (
      (1 + productData.percentageProfit / 100.0) *
      productData.buyingPrice
    ).toFixed(2),
    quantity: productData.quantity,
    adminId: productData.adminId,
    adminName: productData.adminName
  });
  return product.save();
};

productSchema.statics.getTotalNumberOfProducts = function() {
  return this.find().countDocuments();
};

productSchema.statics.getProductsWhoseQuantityIsGreaterThanZero = async function(
  page = 1
) {
  const total = await this.getTotalNumberOfProducts();
  const paginationData = {
    hasNextPage: page * PRODUCTS_PER_PAGE < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page
  };

  const products = await this.find({ quantity: { $gt: 0 } })
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
  return {
    paginationData,
    products
  };
};

productSchema.statics.findPageProductsForAdminId = async function(
  adminId,
  page
) {
  const total = await this.getTotalAdminProducts(adminId);
  const paginationData = {
    hasNextPage: page * PRODUCTS_PER_PAGE < total,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page
  };
  const products = await this.find({ adminId: adminId })
    .skip((page - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
  return {
    paginationData,
    products
  };
};
productSchema.statics.getTotalAdminProducts = function(adminId) {
  return this.find({ adminId: adminId }).countDocuments();
};

productSchema.statics.deleteById = function(prodId) {
  return this.findByIdAndDelete(prodId);
};

productSchema.methods.isCreatedByAdminId = function(adminId) {
  return this.adminId.toString() === adminId.toString();
};
productSchema.methods.hasExpired= function(){
  return this.timestamp>this.expirationPeriod*24*60*60*1000;
}
productSchema.methods.reduceQuantityByOne = function() {
  this.quantity--;
  return this.save(); 
};
productSchema.methods.increaseQuantityBy = function(increaseBy) {
  this.quantity += increaseBy;
  return this.save();
};
productSchema.methods.updateDetails = function(productData) {
  const imageFile=productData.imageFile;
  let imageUrl;
  if (!imageFile) {
    imageUrl = this.imageUrl;
  }

  //to avoid race condition, delete current product image before updating the product
  if (imageFile) {
    imageUrl = imageFile.path;
    imageDeleter(this.imageUrl);
  }

  this.title = productData.title;
  this.imageUrl = imageUrl;
  this.buyingPrice = productData.buyingPrice;
  this.percentageProfit = productData.percentageProfit;
  this.expirationPeriod = productData.expirationPeriod;
  this.sellingPrice = (
    (1 + productData.percentageProfit / 100.0) *
    productData.buyingPrice
  ).toFixed(2);
  this.description = productData.description;
  this.quantity = productData.quantity;
  return this.save();
};
module.exports = mongoose.model("Product", productSchema);
