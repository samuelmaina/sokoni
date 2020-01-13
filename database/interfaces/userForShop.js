const User = require("../models/user");

class UserForShop {
  constructor(Model) {
    this.Model = Model;
  }
  async findCartProductsAndTheirTotalForId(Id) {
    const userWithPopulatedCart = await this.Model.findById(Id)
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
}
 
module.exports=new UserForShop(User)