const { AdminSales } = require("../models/index");

class AdminSalesForShop {
  constructor(Model) {
    this.Model = Model;
  }
  /**
   *create a new Sales for an Admin
   * @param {String} adminId - adminId to create new sales
   * @returns return the created adminSales
   */
  createNew(adminId) {
    return this.Model.createNew(adminId);
  }

  /**
   *
   * @param {id} adminId -admin ID
   * @returns {object}-returns sales of the requested admin Id as an object
   */
  findSalesForAdminId(adminId) {
    return this.Model.findOneForAdminId(adminId);
  }
}
module.exports = new AdminSalesForShop(AdminSales);
