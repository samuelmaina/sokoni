const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Order = new Schema({
  products: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {type: Number},
    },
  ],
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

const byAscendingOrderTime = {time: -1};

const pathToPopulate = "products.productData";

Order.statics.createOne = function (orderData) {
  const order = new this({
    userId: orderData.userId,
    products: orderData.products,
  });
  return order.save();
};

Order.statics.findByIdAndPopulateProductsDetails = async function (id) {
  const byIdQuery = {_id: id};
  const orders = await this.findWithPopulated(
    byIdQuery,
    pathToPopulate,
    "title sellingPrice"
  );
  return orders[0];
};
Order.statics.findAllforUserId = function (userId) {
  const byUserIdQuery = {userId};
  return this.findWithPopulated(
    byUserIdQuery,
    pathToPopulate,
    "title sellingPrice"
  );
};

Order.methods.isOrderedById = function (Id) {
  return Id.toString() === this.userId.toString();
};
Order.methods.populateDetails = function () {
  const whatToPopulate = "title sellingPrice adminId";
  return this.populate(pathToPopulate, whatToPopulate).execPopulate();
};

//helper methods
Order.statics.findWithPopulated = async function (
  query,
  pathToPopulate,
  whatToPopulate
) {
  return await this.find(query)
    .populate(pathToPopulate, whatToPopulate)
    .sort(byAscendingOrderTime);
};

module.exports = mongoose.model("Order", Order);
