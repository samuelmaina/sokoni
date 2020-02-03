const mongoose = require("mongoose");
const Base = require("./baseForAdminAndUser");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  cart: {
    products: [
      {
        productData: {
          type: Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: { type: Number }
      }
    ]
  }
});

userSchema.statics.findCartProductsAndTheirTotalForId = async function(Id) {
  const userWithPopulatedCart = await this.findById(Id)
    .populate("cart.products.productData", "price title")
    .exec();
  if (!userWithPopulatedCart) {
    throw new Error("No user by that Id exists");
  }
  const cartProducts = userWithPopulatedCart.cart.products;
  let total = 0.0;
  cartProducts.forEach(product => {
    total += product.productData.price * product.quantity;
  });
  return {
    cartProducts,
    total
  };
};
userSchema.statics.findUserByIdAndPopulateCartProductsDetails = function(Id) {
  return this.findById(Id)
    .populate("cart.products.productData", "sellingPrice title")
    .exec();
};

userSchema.methods.addProductIdToCart = function(prodId) {
  const cartProductIndex = this.cart.products.findIndex(cp => {
    return cp.productData.toString() === prodId.toString();
  });
  let newQuantity = 1;
  const updatedCartProducts = [...this.cart.products];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.products[cartProductIndex].quantity + newQuantity;
    updatedCartProducts[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartProducts.push({
      productData: prodId,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    products: updatedCartProducts
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteProductIdFromCart = async function(prodId) {
  const deletedProductIndex = this.cart.products.findIndex(cp => {
    return cp.productData.toString() === prodId.toString();
  });
  const deletedQuantity = this.cart.products[deletedProductIndex].quantity;
  const updatedCartProducts = this.cart.products.filter(cp => {
    return cp.productData.toString() !== prodId.toString();
  });
  const updatedCart = {
    products: updatedCartProducts
  };
  this.cart = updatedCart;
  await this.save();
  return deletedQuantity;
};

userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};
userSchema.methods.getCartProducts = function() {
  return this.cart.products;
};

module.exports = Base.discriminator("User", userSchema);
