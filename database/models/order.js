const mongoose = require("mongoose");

const ranges = require("../../config/constraints");
const {
  ensureIsMongooseId,
  ensureIsNonEmptyObject,
  ensureIsPositiveInt,
} = require("./utils");

const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const { exact, error } = ranges.mongooseId;
const { quantity, total } = ranges.order;
const { min, max } = quantity;

const Order = new Schema({
  products: [
    {
      productData: {
        required: "Your must provide a product Id.",
        type: ObjectId,
        ref: "Product",
        maxlength: 24,
        minlength: 24,
      },
      quantity: {
        required: "Quantity must be 1 to 20000",
        type: Number,
        min: 1,
        max: 20000,
      },
    },
  ],
  userId: {
    type: ObjectId,
    ref: "User",
    required: "The user id must be provided.",
    maxlength: 24,
    minlength: 24,
  },
  time: {
    type: Date,
    default: Date.now(),
  },
  total: {
    type: Number,
    required: "Total must be provided. must be 1 to 2,000,000",
    min: 1,
    max: 2000000,
  },
});

const byAscendingOrderTime = { time: -1 };

const pathToPopulate = "products.productData";

const { statics, methods } = Order;

statics.createOne = function (orderData) {
  const order = new this(orderData);
  return order.save();
};

statics.findByIdAndPopulateProductsDetails = async function (id) {
  ensureIsMongooseId(id);
  const byIdQuery = { _id: id };
  const orders = await this.findWithPopulated(
    byIdQuery,
    pathToPopulate,
    "title sellingPrice"
  );

  return orders[0];
};
statics.findAllforUserId = function (userId) {
  const byUserIdQuery = { userId };
  return this.findWithPopulated(
    byUserIdQuery,
    pathToPopulate,
    "title sellingPrice"
  );
};

methods.isOrderedById = function (Id) {
  return Id.toString() === this.userId.toString();
};
methods.populateDetails = function () {
  const whatToPopulate = "title sellingPrice adminId";
  return this.populate(pathToPopulate, whatToPopulate);
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
