const mongoose = require('mongoose');

const ranges = require('../../config/constraints');
const {
	ensureIsMongooseId,
	ensureIsNonEmptyObject,
	ensureIsPositiveInt,
} = require('./utils');

const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;
const { exact, error } = ranges.mongooseId;
const { quantity, total } = ranges.order;
const { min, max } = quantity;

const Order = new Schema({
	products: [
		{
			productData: {
				required: [true, error],
				type: ObjectId,
				ref: 'Product',
				maxlength: [exact, error],
				minlength: [exact, error],
			},
			quantity: {
				required: quantity.error,
				type: Number,
				min: [min, quantity.error],
				max: [max, quantity.error],
			},
		},
	],
	userId: {
		type: ObjectId,
		ref: 'User',
		required: [true, error],
		maxlength: [exact, error],
		minlength: [exact, error],
	},
	time: {
		type: Date,
		default: Date.now(),
	},
	total: {
		type: Number,
		required: total.error,
		min: [total.min, total.error],
		max: [total.max, total.error],
	},
});

const byAscendingOrderTime = { time: -1 };

const pathToPopulate = 'products.productData';

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
		'title sellingPrice'
	);

	return orders[0];
};
statics.findAllforUserId = function (userId) {
	const byUserIdQuery = { userId };
	return this.findWithPopulated(
		byUserIdQuery,
		pathToPopulate,
		'title sellingPrice'
	);
};

methods.isOrderedById = function (Id) {
	return Id.toString() === this.userId.toString();
};
methods.populateDetails = function () {
	const whatToPopulate = 'title sellingPrice adminId';
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

module.exports = mongoose.model('Order', Order);
