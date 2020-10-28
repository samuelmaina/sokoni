const mongoose = require("mongoose");
const {adminSalesServices} = require("../services");

const Schema = mongoose.Schema;

const AdminSales = new Schema({
  adminID: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  products: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      sales: [
        {
          quantity: {type: Number},
          soldAt: {type: Date},
        },
      ],
    },
  ],
});

AdminSales.statics.createOne = async function (adminID) {
  const adminSale = new this({
    adminID,
  });
  return await adminSale.save();
};
AdminSales.statics.findOneForAdminId = function (adminID) {
  return this.findOne({adminID}).populate(
    "products.productData",
    "title sellingPrice buyingPrice imageUrl"
  );
};

AdminSales.statics.findByAdminIdAndDelete = async function (adminID) {
  await this.findOneAndDelete({adminID});
};
AdminSales.statics.findSalesForAdminIDWithinAnInterval = async function (
  adminID,
  fromTime,
  toTIme
) {
  const adminSales = await this.findOneForAdminId(adminID);
  if (!adminSales) return [];
  const productsToDisplay = adminSales.findSalesWithinAnInterval(
    fromTime,
    toTIme
  );
  return adminSalesServices.calculatProductsSalesData(productsToDisplay);
};

AdminSales.statics.findSalesForAdminIDWithinAnInterval = async function (
  adminID,
  fromTime,
  toTIme
) {
  const adminSales = await this.findOneForAdminId(adminID);
  if (!adminSales) return [];
  const productsToDisplay = adminSales.findSalesWithinAnInterval(
    fromTime,
    toTIme
  );
  return adminSalesServices.calculatProductsSalesData(productsToDisplay);
};

AdminSales.methods.findSalesWithinAnInterval = function (
  fromTime = Date.now() - 1000 * 60 * 60 * 24 * 7,
  toTIme = Date.now()
) {
  const soldProducts = this.products;
  return adminSalesServices.getProductsWithinAnInterval(
    soldProducts,
    fromTime,
    toTIme
  );
};

AdminSales.methods.addOrderedProducts = async function (saleDetails) {
  const soldProducts = this.products;
  this.products = adminSalesServices.addSoldProducts(soldProducts, saleDetails);
  return this.save();
};

AdminSales.methods.clearProducts = async function () {
  this.products = [];
  return await this.save();
};

module.exports = mongoose.model("AdminSale", AdminSales);
