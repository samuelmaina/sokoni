const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = new Schema({
  orderedProducts: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: { type: Number },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  time: {
    type: Date,
    default: Date.now(),
  },
});

Order.statics.createNew = function (orderData) {
  const order = new this({
    userId: orderData.userId,
    orderedProducts: orderData.orderedProducts,
    total: orderData.total,
  });
  return order.save();
};
const byAscendingOrderTime = { time: -1 };

Order.statics.findAllforUserId = function (userId) {
  return this.find({ userId })
    .populate("orderedProducts.productData", "title sellingPrice")
    .sort(byAscendingOrderTime)
    .exec();
};

Order.statics.findByIdAndPopulateProductsDetails = function (Id) {
  return this.findById(Id)
    .populate("orderedProducts.productData", "title sellingPrice adminId")
    .sort(byAscendingOrderTime)
    .exec();
};

Order.methods.isOrderedById = function (Id) {
  return Id.toString() === this.userId.toString();
};
Order.methods.getOrderedProducts = function () {
  return this.orderedProducts;
};
Order.methods.getTotal = function () {
  return this.total;
};
Order.methods.getUserId = function () {
  return this.userId;
};

module.exports = mongoose.model("Order", Order);
