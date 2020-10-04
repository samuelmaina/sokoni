const mongoose = require("mongoose");
const Base = require("./baseForAdminAndUser");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  cart: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: { type: Number },
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
  let total = 0.0;
  cartProducts.forEach((product) => {
    total += product.productData.getSellingPrice() * product.quantity;
  });
  total = Number(total.toFixed(2));
  return {
    cartProducts,
    total,
  };
};

userSchema.methods.addProductIdToCart = function (prodId, quantity) {
  const cartProductIndex = this.cart.findIndex((cp) => {
    return cp.productData.toString() === prodId.toString();
  });
  let newQuantity = parseInt(quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Can only add quantity  greater than zero");
  }
  const updatedCartProducts = [...this.cart];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart[cartProductIndex].quantity + newQuantity;
    updatedCartProducts[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartProducts.push({
      productData: prodId,
      quantity: newQuantity,
    });
  }
  this.cart = updatedCartProducts;
  return this.save();
};

userSchema.methods.deleteProductIdFromCart = async function (prodId) {
  const deletedProductIndex = this.cart.findIndex((cp) => {
    return cp.productData.toString() === prodId.toString();
  });
  const deletedQuantity = this.cart[deletedProductIndex].quantity;
  const updatedCartProducts = this.cart.filter((cp) => {
    return cp.productData.toString() !== prodId.toString();
  });

  this.cart = updatedCartProducts;
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
