const path = require('path');

const { Product, Metadata } = require('../../../database/models');
const { PRODUCTS_PER_PAGE } = require('../../../config/env');
const statics = require('./statics');
const methods = require('./methods');

const {
	verifyEqual,
	verifyRejectsWithError,
	verifyNull,
	verifyTruthy,
	ensureMongooseArraysAreEqual,
	ensureArrayContains,
	verifyIDsAreEqual,
	ensureObjectHasKeyValuePair,
} = require('../../utils/testsUtils');

const {
	createTestProducts,
	clearDb,
} = require('../../utils/generalUtils/database');
const {
	generateMongooseId,
	generateStringSizeN,
	returnObjectWithoutProp,
	generateRandomIntInRange,
	generateRandomFloatInRange,
	generateRandomMongooseIds,
	generatePerfectProductData,
} = require('../../utils/generalUtils/utils');
const { product } = require('../../../config/constraints');
const {
	ranges,
	includeSetUpAndTearDown,
	ValidationError,
	mergeBintoA,
	ensureObjectsHaveSameFields,
	productProps,
	validateStringField,
	validateFloatField,
} = require('../utils');

const prodRanges = product;

const MAX_SETUP_TIME = 20000;

describe('--Product', () => {
	includeSetUpAndTearDown();
	describe('Statics', statics);
	describe.only('Methods', methods);
});

function ensureEachProductHasCategory(prods, category) {
	prods.forEach(prod => {
		expect(prod.category).toBe(category);
	});
}
