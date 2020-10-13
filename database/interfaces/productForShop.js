const {Product} = require("../models/index");

class ProductForShop {
  constructor(Model) {
    this.Model = Model;
  }

  /**
   * return all the products in the database
   */
  getPresentCategories() {
    return this.Model.getPresentCategories();
  }

  /**
   *
   * @param {Object} category
   * @param {Number} page
   */
  findCategoryProducts(category, page) {
    return this.Model.findCategoryProducts(category, page);
  }

  /**
   * Finds all the products for a certain page
   * @param {Number} page The page that we want to get productS for
   * @returns an object with the pagination data for the page and also the products
   */
  async findProductsForPage(page) {
    return this.Model.getProductsWhoseQuantityIsGreaterThanZero(page);
  }
}

/**
 * finds  a product with the provided Id
 * @param {String} Id-.The product Id
 */
ProductForShop.prototype.findById = function (Id) {
  return this.Model.findById(Id);
};
module.exports = new ProductForShop(Product);
