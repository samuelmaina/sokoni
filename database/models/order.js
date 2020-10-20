const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = new Schema({
  orderedProducts: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {type: Number},
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
const byAscendingOrderTime = {time: -1};

Order.statics.findWithPopulated = async function (
  query,
  pathToPopulate,
  whatToPopulate
) {
  return await this.find(query)
    .populate(pathToPopulate, whatToPopulate)
    .sort(byAscendingOrderTime);
};
const pathToPopulate = "orderedProducts.productData";

Order.statics.findAllforUserId = function (userId) {
  const byUserIdQuery = {userId};
  return this.findWithPopulated(
    byUserIdQuery,
    pathToPopulate,
    "title sellingPrice"
  );
};

Order.statics.findByIdAndPopulateProductsDetails = async function (id) {
  const byIdQuery = {_id: id};
  const populatePath = pathToPopulate;
  const whatToPopulate = " title sellingPrice adminId";
  //the normal findById return one document but find({id:id}) returns
  //an array with just one document.so we need to return first element to mimic findById.
  return (
    await this.findWithPopulated(byIdQuery, populatePath, whatToPopulate)
  )[0];
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
