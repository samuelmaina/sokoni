const mongoose = require("mongoose");

const ranges = require("../../config/constraints");

const Product = require("./product");
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
  totalNoOfSales: {
    type: Number,
    default: 0,
  },
  profitTrend: {
    profits: [
      {
        type: Number,
        required: "Please provide storage of admin Profits.",
      },
    ],
    timeStamps: [
      {
        type: Date,
        required: "Provide the timeStamp array",
      },
    ],
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
      sales: {
        timeStamps: [
          {
            type: Date,
            required: "The Date must be provided",
          },
        ],
        totals: [
          {
            type: Number,
            required: "Must provide the current total of production",
            min: 0,
          },
        ],

        revenueTrend: [
          {
            type: Number,
            required: "Must provide the current revenue rate",
            min: 0,
          },
        ],
      },
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
    "title sellingPrice imageUrl"
  );
  if (sales) {
    const { profitTrend, products, totalNoOfSales } = sales;
    const totalProfit =
      profitTrend.profits[totalNoOfSales - 1] * totalNoOfSales;
    const result = {
      profitTrend,
      products,
      totalProfit,
    };

    return result;
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
  const profits = this.profitTrend.profits;
  const timeStamps = this.profitTrend.timeStamps;

  let noOfSales = this.totalNoOfSales;
  const { productId, quantity } = saleDetails;
  const { sellingPrice, buyingPrice } = await Product.findById(productId);
  const saleTotal = sellingPrice * quantity;
  addSale(soldProducts, productId, saleTotal);

  const currentProfit = saleTotal - buyingPrice * quantity;
  timeStamps.push(Date.now());
  if (noOfSales < 1) {
    profits.push(currentProfit);
  } else {
    const newTotalProfit = profits[noOfSales - 1] * noOfSales + currentProfit;
    console.log(newTotalProfit, noOfSales);
    profits.push(newTotalProfit / (noOfSales + 1));
  }

  this.totalNoOfSales++;

  return await this.save();
};

methods.clearProducts = async function () {
  this.products = [];
  return await this.save();
};

module.exports = mongoose.model("AdminSale", AdminSales);
