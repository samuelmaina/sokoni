const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },  
  email: {
    type: String,
    required: true
  },
  password:{
   type:String,
   required:true
  },
  resetToken:String,
  tokenExpiration:Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});


// add a  product to the cart
userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];//maintain the old cart,so that we dont introduce an existing productS

  // if the product has an indexed(it exists)
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;//increment the previous quantity by one
    updatedCartItems[cartProductIndex].quantity = newQuantity;//then update the quantity to incremented quantity
  } else {
    // product does not exist  so add it to the cart 
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    // update the cart which ever the above case
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};



userSchema.methods.deleteItemFromCart = function(prodId) {
  const updatedCartItems = this.cart.items.filter(cp => {
    return cp.productId.toString() !== prodId.toString();
  });
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
};




userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
