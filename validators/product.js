const ranges = require('../config/constraints').product;
const body = require('express-validator').check;

const {
	title,
	buyingPrice,
	percentageProfit,
	quantity,
	description,
	brand,
	category,
} = ranges;

exports.title = body('title')
	.isString()
	.withMessage('Title must be a string.')
	.isLength({ min: title.minlength, max: title.maxlength })
	.withMessage(title.error);

exports.buyingPrice = body('buyingPrice')
	.isNumeric()
	.withMessage('Buying price must be a number.')
	.custom(value => {
		const { min, max, error } = ranges.buyingPrice;
		if (!(value >= min && value <= max)) {
			throw new Error(error);
		}
		return true;
	});
exports.percentageProfit = body('percentageProfit')
	.isNumeric()
	.withMessage('Percentage profit must be a number.')
	.custom(value => {
		const { min, max, error } = percentageProfit;
		if (!(value >= min && value <= max)) {
			throw new Error(error);
		}
		return true;
	});
exports.quantity = body('quantity')
	.isNumeric()
	.withMessage('Quantity must be a number.')
	.isInt()
	.withMessage('Quantity must be a whole number.')
	.custom(value => {
		const { min, max, error } = quantity;

		if (!(value >= min && value <= max)) {
			throw new Error(error);
		}
		return true;
	});

exports.description = body('description')
	.isString()
	.withMessage('Description must be a string.')
	.isLength({
		min: ranges.description.minlength,
		max: ranges.description.maxlength,
	})
	.withMessage(ranges.description.error);

exports.brand = body('brand')
	.isString()
	.withMessage('Brand must be a string.')
	.isLength({
		min: ranges.brand.minlength,
		max: ranges.brand.maxlength,
	})
	.withMessage(ranges.brand.error);

exports.category = body('category')
	.isString()
	.withMessage('Category must be a string.')
	.isLength({
		min: ranges.category.minlength,
		max: ranges.category.maxlength,
	})
	.withMessage(ranges.category.error);

exports.productValidator = [
	this.title,
	this.buyingPrice,
	this.percentageProfit,
	this.quantity,
	this.brand,
	this.category,
	this.description,
];
