const ranges = require('../../config/constraints').product;
const {
	validateStringField,
	validateFloatField,
	validateIntegerField,
} = require('./utils');

const { product } = require('../../validators');

const {
	title,
	buyingPrice,
	percentageProfit,
	quantity,
	description,
	brand,
	category,
	productValidator,
} = product;

describe('Product validator', () => {
	describe('Title', () => {
		const { minlength, maxlength, error } = ranges.title;
		validateStringField()
			.onField('title')
			.usingValidator(title)
			.withLowerLimitLength(minlength)
			.withUpperLimitLength(maxlength)
			.withFielNameOnErrrorAs('Title')
			.withErrorMessage(error)
			.runTests();
	});
	describe('Buying price', () => {
		const delta = 0.01;
		const { min, max, error } = ranges.buyingPrice;
		validateFloatField()
			.onField('buyingPrice')
			.usingValidator(buyingPrice)
			.withLowerLimit(min)
			.withUpperLimit(max)
			.withDelta(delta)
			.withFielNameOnErrrorAs('Buying price')
			.withErrorMessageAs(error)
			.runTests();
	});
	describe('Percentage Profit', () => {
		const delta = 0.01;
		const { min, max, error } = ranges.percentageProfit;

		validateFloatField()
			.onField('percentageProfit')
			.usingValidator(percentageProfit)
			.withLowerLimit(min)
			.withUpperLimit(max)
			.withDelta(delta)
			.withErrorMessageAs(error)
			.withFielNameOnErrrorAs('Percentage profit')
			.runTests();
	});
	describe('Quantity', () => {
		const { min, max, error } = ranges.quantity;
		validateIntegerField()
			.onField('quantity')
			.usingValidator(quantity)
			.withLowerLimit(min)
			.withUpperLimit(max)
			.withErrorMessage(error)
			.withFielNameOnErrrorAs('Quantity')
			.runTests();
	});
	describe('Description', () => {
		const { minlength, maxlength, error } = ranges.description;
		validateStringField()
			.onField('description')
			.usingValidator(description)
			.withLowerLimitLength(minlength)
			.withUpperLimitLength(maxlength)
			.withErrorMessage(error)
			.withFielNameOnErrrorAs('Description')
			.runTests();
	});
	describe('Brand', () => {
		const { minlength, maxlength, error } = ranges.brand;
		validateStringField()
			.onField('brand')
			.usingValidator(brand)
			.withLowerLimitLength(minlength)
			.withUpperLimitLength(maxlength)
			.withFielNameOnErrrorAs('Brand')
			.withErrorMessage(error)
			.runTests();
	});
	describe('Category', () => {
		const { minlength, maxlength, error } = ranges.category;
		validateStringField()
			.onField('category')
			.usingValidator(category)
			.withLowerLimitLength(minlength)
			.withUpperLimitLength(maxlength)
			.withErrorMessage(error)
			.withFielNameOnErrrorAs('Category')
			.runTests();
	});
	it('ensure productvalidator has all the field validators.', () => {
		const validators = [
			title,
			buyingPrice,
			percentageProfit,
			quantity,
			description,
			brand,
			category,
		];
		for (const validator of validators) {
			expect(productValidator).toContain(validator);
		}
	});
});
