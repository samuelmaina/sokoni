const mongoose = require("mongoose");

const ranges = require("../../config/constraints");

const { adminSalesServices } = require("../services");
const { addSale } = adminSalesServices;

const Schema = mongoose.Schema;

const AdminSales = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: "Admin Id  must be a mongooose id",
    maxlength: 24,
    minlength: 24,
  },
  products: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: "Product Id must be provided.",
        maxlength: 24,
        minlength: 24,
      },
      sales: [
        {
          quantity: {
            type: Number,
            required: "Must provided the sold quantity",
            max: 20000,
            min: 1,
          },
          //allow a 5 s time for the machine to carry out the operation.
          soldAt: { type: Date, require: true, max: Date.now() + 5000 },
        },
      ],
    },
  ],
});
const { statics, methods } = AdminSales;

statics.createOne = async function (adminId) {
  const adminSale = new this({
    adminId,
  });
  return await adminSale.save();
};
statics.addSalesToAdmins = async function (orderedProducts) {
  for (const product of orderedProducts) {
    const productDetails = product.productData;
    let adminSales = await this.findOneByAdminId(productDetails.adminId);

    if (!adminSales) {
      adminSales = await this.createOne(productDetails.adminId);
    }
    const saleDetails = {
      quantity: product.quantity,
      productId: productDetails._id,
    };
    await adminSales.addSale(saleDetails);
  }
};
statics.findOneForAdminIdAndPopulateProductsData = async function (adminId) {
  const sales = await this.findOne({ adminId }).populate(
    "products.productData",
    "title sellingPrice buyingPrice imageUrl"
  );
  if (sales) {
    const soldOut = adminSalesServices.calculatProductsSalesData(
      sales.products
    );
    return soldOut;
  }
  return [];
};

statics.findByAdminIdAndDelete = async function (adminID) {
  await this.findOneAndDelete({ adminID });
};

statics.findOneByAdminId = async function (adminId) {
  return await this.findOne({ adminId });
};

methods.addSale = async function (saleDetails) {
  const soldProducts = this.products;
  addSale(soldProducts, saleDetails);
  return await this.save();
};

methods.clearProducts = async function () {
  this.products = [];
  return await this.save();
};

module.exports = mongoose.model("AdminSale", AdminSales);
