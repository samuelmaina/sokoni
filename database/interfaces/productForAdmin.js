const { Product } = require("../models/index");
class ProductForAdmin {
  constructor(Model) {
    this.Model = Model;
  }
  /**
   *Creates a new products
   * @param {Object} productData -the object data that will  be used to  create the product
   */
  createNew(productData) {
    return this.Model.createNew(productData);
  }
  /**
   * Find one by Id
   * @param {String} Id- the Id of the product
   */
  findById(Id) {
    return this.Model.findById(Id);
  }

  /**
   * Updates a product data by Id
   * @param {*} prodId The product Id
   * @param {*} productData The data of the product to update
   */
  async updateDetailsForProductById(prodId, productData) {
    const product = await this.findById(prodId);
    await product.updateDetails(productData);
  }
  /**
   * Returns all the product created by the provided adminId
   * @param {*} adminId
   * @param {*} page -the page that we will display products for
   */
  findPageProductsForAdminId(adminId, page) {
    return this.Model.findPageProductsForAdminId(adminId, page);
  }
  /**
   * Find  a product by an Id and then delete it
   * @param {String} Id -the Id that will be deleted
   */
  deleteById(Id) {
    return this.Model.deleteById(Id);
  }
}
module.exports = new ProductForAdmin(Product);
