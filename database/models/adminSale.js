const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSalesSchema = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  soldProducts: {
    products: [
      {
        productData: {
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

adminSalesSchema.statics.findOneForAdminId = async function(adminId) {
   return this.findOne({ adminId }).populate(
     "soldProducts.products.productData",
     "title sellingPrice timestamp expirationPeriod"
   );
};

adminSalesSchema.statics.getSalesForAdminIdWithinAnInterval= async function(adminId,fromTime,toTIme){
 const adminSales= await this.findOneForAdminId(adminId);
 if(!adminSales) return 'There are no sales for this admin'
 const productsToDisplay = adminSales.findSalesWithinAnInterval(
   fromTime,
   toTIme
 )
 return productsToDisplay
}

adminSalesSchema.methods.findSalesWithinAnInterval = function(
  fromTime,
  toTIme
) {
  const soldProducts = this.getSoldProducts();
  const productsToDisplay = [];
  for (const product of soldProducts) {
    let salesMeetingCriterion = product.productSales.filter(sale => {
      return sale.soldAt >= fromTime && sale.soldAt <= toTIme;
    });
    productsToDisplay.push({
      productData: product.productData,
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
    return product.productData.toString() === saleDetails.productId.toString();
  });
  const updatedProducts = [...this.soldProducts.products];
  if (productIndex >= 0) {
    updatedProducts[productIndex].productSales.push({
      quantity: saleDetails.quantity,
      soldAt: saleDetails.soldAt
    });
  } else {
    updatedProducts.push({
      productData: saleDetails.productId,
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

module.exports = mongoose.model("AdminSale", adminSalesSchema);
