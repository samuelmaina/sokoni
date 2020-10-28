const mongoose = require("mongoose");
const Base = require("./baseForAdminAndUser");

const {UserServices} = require("../services/index");

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

userSchema.methods.addProductsToCart = function (productId, quantity) {
  const cart = this.cart;
  this.cart = UserServices.addProductIdToCart(cart, productId, quantity);
  return this.save();
};

userSchema.methods.deleteProductsFromCart = async function (prodId) {
  const cart = this.cart;
  const {updatedCart, deletedQuantity} = UserServices.deleteProductIdfromCart(
    cart,
    prodId
  );
  this.cart = updatedCart;
  await this.save();
  return deletedQuantity;
};

userSchema.methods.populateCartProductsDetails = async function () {
  await this.populate("cart.productData", "sellingPrice title").execPopulate();
  const cart = this.cart;
  const total = UserServices.calculateProductsTotals(cart);
  return {
    cart,
    total,
  };
};

userSchema.methods.clearCart = function () {
  this.cart = [];
  return this.save();
};

userSchema.methods.incrementBalance = function (amount) {
  if (amount < 0) {
    throw new Error("we can not increment such amount");
  }
  let increment = +amount;
  let balance = +this.balance;
  balance += increment;
  this.balance = Number(balance.toFixed(2));
  return this.save();
};
userSchema.methods.decrementBalance = function (amount) {
  let reduction = amount;
  let balance = this.balance;
  if (balance >= amount) balance -= reduction;
  else throw new Error("can not reduce such an amount");
  this.balance = Number(balance.toFixed(2));
  return this.save();
};

module.exports = Base.discriminator("User", userSchema);
