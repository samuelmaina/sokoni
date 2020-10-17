const mongoose = require("mongoose");
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
  if (!adminSales) return null;
  const productsToDisplay = adminSales.findSalesWithinAnInterval(
    fromTime,
    toTIme
  );

  return calculatProductsSalesData(productsToDisplay);
};

const calculatProductsSalesData = products => {
  let productsAndTheirProfits = [];
  products.forEach(product => {
    let profit = 0.0;
    let totalSales = 0.0;
    product.sales.forEach(sale => {
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
};
AdminSales.statics.deleteById = function (Id) {
  return this.findByIdAndDelete(Id);
};
AdminSales.methods.findSalesWithinAnInterval = function (
  fromTime = Date.now() - 1000 * 60 * 60 * 24 * 7,
  toTIme = Date.now()
) {
  const soldProducts = this.getSoldProducts();
  const productsToDisplay = [];
  for (const product of soldProducts) {
    let salesMeetingCriterion = product.sales.filter(sale => {
      return sale.soldAt >= fromTime && sale.soldAt <= toTIme;
    });
    productsToDisplay.push({
      productData: product.productData,
      sales: salesMeetingCriterion,
    });
  }
  return productsToDisplay;
};

AdminSales.methods.addOrderedProduct = async function (saleDetails) {
  const soldProducts = this.products;
  const productIndex = soldProducts.findIndex(product => {
    return (
      product.productData._id.toString() === saleDetails.productId.toString()
    );
  });
  const updatedProducts = [...soldProducts];
  if (productIndex >= 0) {
    updatedProducts[productIndex].sales.push({
      quantity: saleDetails.quantity,
      soldAt: Date.now(),
    });
  } else {
    updatedProducts.push({
      productData: saleDetails.productId,
      sales: [
        {
          quantity: saleDetails.quantity,
          soldAt: Date.now(),
        },
      ],
    });
  }
  this.products = updatedProducts;
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
