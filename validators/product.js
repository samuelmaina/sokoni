const ranges = require('../config/constraints').product;

const { body, check } = require('express-validator');
const { stringValidator, floatValidator, intValidator } = require('./utils');

const {
	title,
	buyingPrice,
	percentageProfit,
	quantity,
	description,
	brand,
	category,
} = ranges;

exports.title = stringValidator(
	'title',
	title.minlength,
	title.maxlength,
	title.error
);
exports.buyingPrice = floatValidator(
	'buyingPrice',
	buyingPrice.min,
	buyingPrice.max,
	buyingPrice.error
);

exports.percentageProfit = floatValidator(
	'percentageProfit',
	percentageProfit.min,
	percentageProfit.max,
	percentageProfit.error
);

exports.quantity = intValidator(
	'quantity',
	quantity.min,
	quantity.max,
	quantity.error
);

exports.description = stringValidator(
	'description',
	description.minlength,
	description.maxlength,
	description.error
);

exports.brand = stringValidator(
	'brand',
	brand.minlength,
	brand.maxlength,
	brand.error
);
exports.category = stringValidator(
	'category',
	category.minlength,
	category.maxlength,
	category.error
);
exports.productValidator = [
	this.title,
	this.buyingPrice,
	this.percentageProfit,
	this.quantity,
	this.brand,
	this.category,
	this.description,
];
