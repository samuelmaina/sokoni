const AdminSales=require('../models/adminSale');
class AdminSalesForAdmin {
  constructor(Model) {
    this.Model = Model;
  }
  /**
   *
   * Get all the sales within a period for an admin with the provided Id
   * @param {Number} adminId -the admin to get product
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
   * @param {Number} adminId -delete sales for an admin
   */
  deleteSalesForAdminId(adminId) {
    return this.Model.findOneAndRemove({ adminId });
  }
  /**
   *Finds all the profits and losses for an admin with the provided Id within a period of t
   time
   * @param {Number} adminId -the admin to get product
   * @param {Date} fromTime -the time from which to count
   * @param {Date} ToTime -to the time to  of the interval
   * the function return the profit for an interval
   */
  async modifyWithinAnIntervalForAdminId(adminId, fromTime, ToTime) {
    const productsAndTheirProfits = [];
    const adminSales = await this.getSalesForAdminIdWithinAnInterval(
      adminId,
      fromTime,
      ToTime
    );
    for (const product of adminSales) {
      console.log(product);
      const expirationPeriod =
        product.productData.expirationPeriod * 24 * 60 * 60 * 1000;
      const timestamp = product.productData.timestamp;
      console.log(expirationPeriod);
      console.log(Date.now() - expirationPeriod);
      console.log(Date.now());
      let profit = 0.0;
      let counter = 0;
      for (const sale of product.productSales) {
        console.log(counter);
        counter++;
        if (Date.now() - expirationPeriod <= timestamp) {
          profit += sale.quantity * product.productData.sellingPrice;
        } else {
          return "running at a loss";
        }
      }
      profit = profit.toFixed(2);
      productsAndTheirProfits.push({
        productId: product.productData._id,
        profit: profit
      });
      return productsAndTheirProfits;
    }
  }
}
module.exports=new AdminSalesForAdmin(AdminSales);