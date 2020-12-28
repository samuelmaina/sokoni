const mongoose = require("mongoose");
const Base = require("./baseForAdminAndUser");

const {UserServices} = require("../services/index");

const {
  ensureIsMongooseId,
  ensureIsPositiveInt,
  ensureIsPositiveFloat,
} = require("./utils");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  cart: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {type: Number, required: true},
    },
  ],
  balance: {
    type: Number,
    default: 10000,
  },
});

const {methods} = userSchema;

methods.addProductsToCart = function (productId, quantity) {
  ensureIsMongooseId(productId);
  ensureIsPositiveInt(quantity);
  const cart = this.cart;
  this.cart = UserServices.addProductIdToCart(cart, productId, quantity);
  return this.save();
};

methods.deleteProductsFromCart = async function (prodId) {
  ensureIsMongooseId(prodId);
  const cart = this.cart;
  const {updatedCart, deletedQuantity} = UserServices.deleteProductIdfromCart(
    cart,
    prodId
  );
  this.cart = updatedCart;
  await this.save();
  return deletedQuantity;
};

methods.populateCartProductsDetails = async function () {
  await this.populate("cart.productData", "sellingPrice title").execPopulate();
  const cart = this.cart;
  const total = UserServices.calculateProductsTotals(cart);
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
  ensureIsPositiveFloat(amount);
  let increment = +amount;
  let balance = +this.balance;
  balance += increment;
  this.balance = Number(balance.toFixed(2));
  return this.save();
};
methods.decrementBalance = function (amount) {
  ensureIsPositiveFloat(amount);
  let reduction = amount;
  let balance = this.balance;
  if (balance >= amount) balance -= reduction;
  else throw new Error("can not reduce such an amount");
  this.balance = Number(balance.toFixed(2));
  return this.save();
};

module.exports = Base.discriminator("User", userSchema);
