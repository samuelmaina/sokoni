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
      },
      quantity: {type: Number},
    },
  ],
  currentBalance: {
    type: Number,
    default: 10000,
  },
});

userSchema.statics.findCartProductsAndTheirTotalForId = async function (Id) {
  const userWithPopulatedCart = await this.findById(Id)
    .populate("cart.productData", "sellingPrice title")
    .exec();

  if (!userWithPopulatedCart) {
    throw new Error("No user by that Id exists");
  }
  const cartProducts = userWithPopulatedCart.getCartProducts();
  const total = UserServices.calculateProductsTotals(cartProducts);
  return {
    cartProducts,
    total,
  };
};

userSchema.methods.addProductIdToCart = function (productId, quantity) {
  const cart = this.cart;
  this.cart = UserServices.addProductIdToCart(cart, productId, quantity);
  return this.save();
};

userSchema.methods.deleteProductIdFromCart = async function (prodId) {
  const cart = this.cart;
  const {updatedCart, deletedQuantity} = UserServices.deleteProductIdfromCart(
    cart,
    prodId
  );
  this.cart = updatedCart;
  await this.save();
  return deletedQuantity;
};

userSchema.methods.clearCart = function () {
  this.cart = [];
  return this.save();
};
userSchema.methods.getCartProducts = function () {
  return this.cart;
};

userSchema.methods.incrementAccountBalance = function (amount) {
  if (amount < 0) {
    throw new Error("we can not increment such amount");
  }
  let increment = +amount;
  let balance = +this.currentBalance;
  balance += increment;
  this.currentBalance = balance;
  return this.save();
};
userSchema.methods.reduceBalance = function (amount) {
  let reduction = +amount;
  let balance = +this.currentBalance;
  if (balance >= amount) balance -= reduction;
  else throw new Error("can not reduce the such an amount");
  this.currentBalance = balance.toFixed(2);
  return this.save();
};
userSchema.methods.getCurrentBalance = function () {
  return this.currentBalance;
};
module.exports = Base.discriminator("User", userSchema);
