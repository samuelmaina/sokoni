const ranges = require('../config/constraints').shop;
const body = require('express-validator').check;

const { page, category } = ranges;

exports.pageV = body('page')
	.isNumeric()
	.withMessage('Page must be a number.')
	.isInt()
	.withMessage('Page must be a whole number.')
	.custom(value => {
		const { min, max, error } = page;
		if (!(value >= min && value <= max)) {
			throw new Error(error);
		}
		return true;
	});
exports.categoryV = body('category')
	.isString()
	.withMessage('Category must be a string.')
	.isLength({ min: category.minlength, max: category.maxlength })
	.withMessage(category.error);

exports.productQueryValidator = [this.pageV, this.categoryV];
