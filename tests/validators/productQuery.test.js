const { page, category } = require('../../config/constraints').shop;

const { verifyEqual, ensureArrayContains } = require('../utils/testsUtils');

const {
	productQueryValidator,
	pageV,
	categoryV,
} = require('../../validators/productQuery');
const { validateIntegerField, validateStringField } = require('./utils');

describe('productQuery validators', () => {
	describe('pageV', () => {
		const { min, max, error } = page;
		validateIntegerField()
			.onField('page')
			.usingValidator(pageV)
			.withLowerLimit(min)
			.withUpperLimit(max)
			.withErrorMessage(error)
			.withFielNameOnErrrorAs('Page')
			.runTests();
	});

	describe('categoryV', () => {
		const { minlength, maxlength, error } = category;
		validateStringField()
			.onField('category')
			.usingValidator(categoryV)
			.withLowerLimitLength(minlength)
			.withUpperLimitLength(maxlength)
			.withFielNameOnErrrorAs('Category')
			.withErrorMessage(error)
			.runTests();
	});
	it('ensure productQueryValidator has only the page and category validator', () => {
		verifyEqual(productQueryValidator.length, 2);
		const expected = [pageV, categoryV];
		for (const validator of expected) {
			ensureArrayContains(expected, validator);
		}
	});
});
