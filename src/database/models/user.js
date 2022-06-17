const mongoose = require("mongoose");

const { Base, Product } = require("./index");

const { userServices } = require("../services/index");
const { addProductIdToCart } = userServices;

const { ensureIsPositiveFloat } = require("./utils");
const { convertTo2Dps } = require("../utils");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  cart: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        maxlength: 24,
        minlength: 24,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 20000,
      },
    },
  ],
  total: {
    type: Number,
    default: 0,
    min: 0,
  },
  balance: {
    type: Number,
    default: 2000000,
    min: 0,
    max: 2000000,
  },
});

const { methods } = userSchema;

methods.addProductsToCart = async function (productId, quantity) {
  const howMany = Number(quantity);
  const sellingPrice = await getProductSellingPrice(productId);
  this.total += sellingPrice * howMany;
  addProductIdToCart(this.cart, productId, howMany);
  return await this.save();
};

methods.deleteProductIdFromCart = async function (prodId) {
  const cart = this.cart;

  const sellingPrice = await getProductSellingPrice(prodId);

  const { updated, deletedQuantity } = userServices.deleteProductIdfromCart(
    cart,
    prodId
  );
  this.cart = updated;
  this.total -= convertTo2Dps(sellingPrice * deletedQuantity);
  await this.save();
  return deletedQuantity;
};

methods.populateCartProductsDetails = async function () {
  await this.populate("cart.productData", "sellingPrice title");
  const cart = this.cart;
  const total = userServices.calculateProductsTotals(cart);
  return {
    cart,
    total,
  };
};

methods.clearCart = function () {
  this.cart = [];
  return this.save();
};

methods.incrementBalance = function (amount) {
  let increment = +amount;
  let balance = +this.balance;
  balance += increment;
  this.balance = Number(balance.toFixed(2));
  return this.save();
};
methods.decrementBalance = async function (amount) {
  ensureIsPositiveFloat(amount, "Must reduce a positive amount.");
  let reduction = amount;
  let balance = this.balance;
  if (balance >= amount) balance -= reduction;
  else throw new Error("Can not reduce such an amount.");
  this.balance = Number(balance.toFixed(2));
  return await this.save();
};
const userModel = Base.discriminator("User", userSchema);

async function getProductSellingPrice(productId) {
  const product = await Product.findById(productId).select("sellingPrice -_id");
  return Number(product.sellingPrice);
}

module.exports = userModel;
