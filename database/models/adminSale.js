const mongoose = require("mongoose");
const {adminSalesServices} = require("../services");

const Schema = mongoose.Schema;

const AdminSales = new Schema({
  adminId: {
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

AdminSales.statics.createNew = function (adminId) {
  const adminSale = new this({
    adminId: adminId,
  });
  return adminSale.save();
};

AdminSales.statics.findOneForAdminId = function (adminId) {
  return this.findOne({adminId}).populate(
    "products.productData",
    "title sellingPrice buyingPrice imageUrl"
  );
};

AdminSales.statics.getSalesForAdminIdWithinAnInterval = async function (
  adminId,
  fromTime,
  toTIme
) {
  const adminSales = await this.findOneForAdminId(adminId);
  if (!adminSales) return [];
  const productsToDisplay = adminSales.findSalesWithinAnInterval(
    fromTime,
    toTIme
  );
  return adminSalesServices.calculatProductsSalesData(productsToDisplay);
};

AdminSales.statics.deleteById = function (Id) {
  return this.findByIdAndDelete(Id);
};
AdminSales.methods.findSalesWithinAnInterval = function (
  fromTime = Date.now() - 1000 * 60 * 60 * 24 * 7,
  toTIme = Date.now()
) {
  const soldProducts = this.getSoldProducts();
  return adminSalesServices.getProductsWithinAnInterval(
    soldProducts,
    fromTime,
    toTIme
  );
};

AdminSales.methods.addOrderedProduct = async function (saleDetails) {
  const soldProducts = this.products;
  this.products = adminSalesServices.addSoldProducts(soldProducts, saleDetails);
  return this.save();
};

AdminSales.methods.getSoldProducts = function () {
  return this.products;
};

AdminSales.methods.clearSoldProducts = async function () {
  this.products = [];
  return await this.save();
};

module.exports = mongoose.model("AdminSale", AdminSales);
