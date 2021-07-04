const mongoose = require('mongoose');
const Base = require('./baseForAdminAndUser');

const { user, mongooseId } = require('../../config/constraints');
const { userServices } = require('../services/index');
const { addProductIdToCart } = userServices;

const {
	ensureIsMongooseId,
	ensureIsPositiveInt,
	ensureIsPositiveFloat,
	ensureIsInt,
} = require('./utils');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	cart: [
		{
			productData: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: true,
				maxlength: mongooseId,
				minlength: mongooseId,
			},
			quantity: {
				type: Number,
				required: true,
				min: user.quantity.min,
				max: user.quantity.max,
			},
		},
	],
	balance: {
		type: Number,
		default: 10000,
		min: user.balance.min,
		max: user.balance.max,
	},
});

const { methods } = userSchema;

methods.addProductsToCart = async function (productId, quantity) {
	const howMany = Number(quantity);
	const cart = this.cart;
	addProductIdToCart(cart, productId, howMany);
	return await this.save();
};

methods.deleteProductsFromCart = async function (prodId) {
	ensureIsMongooseId(prodId);
	const cart = this.cart;
	const { updatedCart, deletedQuantity } = userServices.deleteProductIdfromCart(
		cart,
		prodId
	);
	this.cart = updatedCart;
	await this.save();
	return deletedQuantity;
};

methods.populateCartProductsDetails = async function () {
	await this.populate('cart.productData', 'sellingPrice title').execPopulate();
	const cart = this.cart;
	const total = userServices.calculateProductsTotals(cart);
	return {
		cart,
		total,
	};
};

methods.clearCart = function () {
	this.cart = [];
	return this.save();
};

methods.incrementBalance = function (amount) {
	ensureIsPositiveFloat(amount);
	let increment = +amount;
	let balance = +this.balance;
	balance += increment;
	this.balance = Number(balance.toFixed(2));
	return this.save();
};
methods.decrementBalance = function (amount) {
	ensureIsPositiveFloat(amount);
	let reduction = amount;
	let balance = this.balance;
	if (balance >= amount) balance -= reduction;
	else throw new Error('can not reduce such an amount');
	this.balance = Number(balance.toFixed(2));
	return this.save();
};

module.exports = Base.discriminator('User', userSchema);
