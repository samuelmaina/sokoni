const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSales = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  soldProducts: {
    products: [
      {
        productData: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        productSales: [
          {
            quantity: { type: Number },
            soldAt: { type: Date },
          },
        ],
      },
    ],
  },
});
AdminSales.statics.deleteById = function (Id) {
  return this.findByIdAndDelete(Id);
};

AdminSales.statics.createNew = function (adminId) {
  const adminSale = new this({
    adminId: adminId,
  });
  return adminSale.save();
};

AdminSales.statics.findOneForAdminId = function (adminId) {
  return this.findOne({ adminId })
    .populate(
      "soldProducts.products.productData",
      "title sellingPrice buyingPrice imageUrl"
    )
    .sort({ "soldProductsproducts.productData": -1 });
};

AdminSales.statics.getSalesForAdminIdWithinAnInterval = async function (
  adminId,
  fromTime,
  toTIme
) {
  const adminSales = await this.findOneForAdminId(adminId);
  if (!adminSales) return null;
  const productsToDisplay = adminSales.findSalesWithinAnInterval(
    fromTime,
    toTIme
  );

  return productsToDisplay;
};

AdminSales.methods.findSalesWithinAnInterval = function (
  fromTime = Date.now() - 1000 * 60 * 60 * 24 * 7,
  toTIme = Date.now()
) {
  const soldProducts = this.getSoldProducts();
  const productsToDisplay = [];
  for (const product of soldProducts) {
    let salesMeetingCriterion = product.productSales.filter((sale) => {
      return sale.soldAt >= fromTime && sale.soldAt <= toTIme;
    });
    productsToDisplay.push({
      productData: product.productData,
      productSales: salesMeetingCriterion,
    });
  }
  return productsToDisplay;
};

AdminSales.methods.addOrderedProduct = async function (saleDetails) {
  const soldProducts = this.soldProducts.products;
  const productIndex = soldProducts.findIndex((product) => {
    return (
      product.productData._id.toString() === saleDetails.productId.toString()
    );
  });
  const updatedProducts = [...soldProducts];
  if (productIndex >= 0) {
    updatedProducts[productIndex].productSales.push({
      quantity: saleDetails.quantity,
      soldAt: saleDetails.soldAt,
    });
  } else {
    updatedProducts.push({
      productData: saleDetails.productId,
      productSales: [
        {
          quantity: saleDetails.quantity,
          soldAt: saleDetails.soldAt,
        },
      ],
    });
  }
  const updatedSoldProducts = {
    products: updatedProducts,
  };
  this.soldProducts = updatedSoldProducts;
  return this.save();
};

AdminSales.methods.getSoldProducts = function () {
  return this.soldProducts.products;
};

AdminSales.methods.clearSoldProducts = async function () {
  this.soldProducts.products = [];
  return await this.save();
};

module.exports = mongoose.model("AdminSale", AdminSales);
