const { User } = require("../models/index");

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
    const {
      cartProducts,
      total,
    } = await this.Model.findCartProductsAndTheirTotalForId(Id);
    return {
      cartProducts,
      total,
    };
  }
}

module.exports = new UserForShop(User);
