const { AdminSales } = require("../models/index");
class AdminSalesForAdmin {
  constructor(Model) {
    this.Model = Model;
  }
  wipeProductWhenItsDeletedByAdmin() {
    AdminSales.findOneAndDelete();
  }
  /**
   *
   * Get all the sales within a period for an admin with the provided Id
   * @param {Date} fromTime -the time from which to count
   * @param {Date} ToTime -to the time to  of the interval
   */
  getSalesForAdminIdWithinAnInterval(adminId, fromTime, ToTime) {
    return this.Model.getSalesForAdminIdWithinAnInterval(
      adminId,
      fromTime,
      ToTime
    );
  }
  /**
   *Deletes all the sales for an admin with the given Id
   * @param {Number} adminId
   */
  deleteSalesForAdminId(adminId) {
    return this.Model.findOneAndRemove({ adminId });
  }
  /**
   *Finds all the profits and losses for an admin with the provided Id within a period of t
   time
   * @param {Number} adminId
   * @param {Date} fromTime -the time from which to count
   * @param {Date} ToTime -the end of time range
   * @returns returns an array of products and their profits
   * for the time range
   */
  async salesWithinAnIntervalForAdminId(adminId, fromTime, ToTime) {
    const productsAndTheirProfits = [];
    const adminSales = await this.getSalesForAdminIdWithinAnInterval(
      adminId,
      fromTime,
      ToTime
    );
    if (adminSales) {
      adminSales.forEach((product) => {
        let profit = 0.0;
        let totalSales = 0.0;
        product.productSales.forEach((sale) => {
          const quantity = sale.quantity;
          const sellingPrice = product.productData.sellingPrice;
          const buyingPrice = product.productData.buyingPrice;
          totalSales += quantity * sellingPrice;
          profit += quantity * (sellingPrice - buyingPrice);
        });
        profit = profit.toFixed(2);
        totalSales = totalSales.toFixed(2);
        productsAndTheirProfits.push({
          title: product.productData.title,
          profit: profit,
          totalSales: totalSales,
          imageUrl: product.productData.imageUrl,
        });
      });
      productsAndTheirProfits.sort((el1, el2) => {
        return el1.profit <= el2.profit;
      });
      return productsAndTheirProfits;
    } else return [];
  }
}
module.exports = new AdminSalesForAdmin(AdminSales);
