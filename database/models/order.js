const mongoose = require("mongoose");
const {
  ensureIsMongooseId,
  ensureIsPositiveInt,
  ensureIsObject,
} = require("./utils");

const Schema = mongoose.Schema;

const Order = new Schema({
  products: [
    {
      productData: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        maxlenght: 22,
      },
      quantity: {type: Number, min: 0, max: 2000},
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    maxlength: 20,
  },
  time: {
    type: Date,
    default: Date.now(),
  },
});

const byAscendingOrderTime = {time: -1};

const pathToPopulate = "products.productData";

const {statics, methods} = Order;

statics.createOne = function (orderData) {
  ensureIsObject(orderData);
  const order = new this({
    userId: orderData.userId,
    products: orderData.products,
  });
  return order.save();
};

statics.findByIdAndPopulateProductsDetails = async function (id) {
  ensureIsMongooseId(id);
  const byIdQuery = {_id: id};
  const orders = await this.findWithPopulated(
    byIdQuery,
    pathToPopulate,
    "title sellingPrice"
  );

  return orders[0];
};
statics.findAllforUserId = function (userId) {
  ensureIsMongooseId(userId);
  const byUserIdQuery = {userId};
  return this.findWithPopulated(
    byUserIdQuery,
    pathToPopulate,
    "title sellingPrice"
  );
};

methods.isOrderedById = function (Id) {
  ensureIsMongooseId(id);
  return Id.toString() === this.userId.toString();
};
methods.populateDetails = function () {
  const whatToPopulate = "title sellingPrice adminId";
  return this.populate(pathToPopulate, whatToPopulate).execPopulate();
};

//helper statics
statics.findWithPopulated = async function (
  query,
  pathToPopulate,
  whatToPopulate
) {
  return await this.find(query)
    .populate(pathToPopulate, whatToPopulate)
    .sort(byAscendingOrderTime);
};

module.exports = mongoose.model("Order", Order);
