const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSalesSchema = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "admin",
    required: true
  },
  soldProducts: {
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product"
        },
        productSales: [
          {
            quantity: { type: Number },
            soldAt: { type: Date }
          }
        ]
      }
    ]
  }
});

adminSalesSchema.statics.createNew = function(adminId) {
  const adminSale = new this({
    adminId: adminId
  });
  return adminSale.save();
};

adminSalesSchema.statics.findOneForAdminId = function(Id) {
  return this.findOne({ adminId: Id });
};

adminSalesSchema.statics.findSoldProductsForAdminId = async function(Id) {
  const adminSale = await this.findOneForAdminId(Id)
  console.log(adminSale)
  if (adminSale) return adminSale.getSoldProducts();
  else throw new Error("The admin Id is undefined");
};

adminSalesSchema.statics.getSalesForAdminIdWithinAnInterval = async function(
  adminId,
  fromTime,
  toTIme
) {
  const soldProducts = await this.findSoldProductsForAdminId(adminId);
  const productsToDisplay = [];
  for (const product of soldProducts) {
    let salesMeetingCriterion = product.productSales.filter(sale => {
      return sale.soldAt >= fromTime && sale.soldAt <= toTIme;
    });
    productsToDisplay.push({
      productId: product.productId,
      productSales: salesMeetingCriterion
    });
  }
  return productsToDisplay;
};

adminSalesSchema.statics.deleteById = function(Id) {
  return this.findByIdAndDelete(Id);
};

adminSalesSchema.methods.addOrderedProduct = async function(saleDetails) {
  const productIndex = this.soldProducts.products.findIndex(product => {
    return product.productId.toString() === saleDetails.productId.toString();
  });
  const updatedProducts = [...this.soldProducts.products];
  if (productIndex >= 0) {
    updatedProducts[productIndex].productSales.push({
      quantity: saleDetails.quantity,
      soldAt: saleDetails.soldAt
    });
  } else {
    updatedProducts.push({
      productId: saleDetails.productId,
      productSales: [
        {
          quantity: saleDetails.quantity,
          soldAt: saleDetails.soldAt
        }
      ]
    });
  }
  const updatedSoldProducts = {
    products: updatedProducts
  };
  this.soldProducts = updatedSoldProducts;
  return this.save();
};

adminSalesSchema.methods.getSoldProducts = function() {
  return this.soldProducts.products;
};

adminSalesSchema.methods.clearSoldProducts = async function() {
  this.soldProducts.products = [];
  return await this.save();
};

module.exports = mongoose.model("adminSale", adminSalesSchema);
