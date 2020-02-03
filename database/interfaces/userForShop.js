const User = require("../models/user");

class UserForShop {
  constructor(Model) {
    this.Model = Model;
  }

  /**
   * Populates cart products with details and the find their total
   * @param {Id} Id -the User Id to get the cart
   * @returns An object containing cart products and their total
   */
  async findCartProductsAndTheirTotalsForUserId(Id) {
    const user = await this.Model.findUserByIdAndPopulateCartProductsDetails(Id);
    if (!user) {
      throw new Error("No user by that Id exists");
    }
    const cartProducts = user.getCartProducts();
    const total=calculateTotalsForProducts(cartProducts);
    return {
      cartProducts,
      total
    };
  };
}
/**
 * finds the totals for an array of products
 * @param {Array} products -the products having  quantities and their products
 */
const calculateTotalsForProducts=(products)=>{
  let total = 0.0;
   products.forEach(product => {
    total += product.productData.sellingPrice * product.quantity;
  });
  total = total.toFixed(2);
  return total
}
 
module.exports=new UserForShop(User)