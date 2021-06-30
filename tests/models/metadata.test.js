const { metadata, Metadata } = require('../../database/models');
const { clearDb } = require('../utils/generalUtils/database');
const { ensureArrayContains, verifyEqual } = require('../utils/testsUtils');
const { includeSetUpAndTearDown } = require('./utils');

describe.skip('Metadata', () => {
	includeSetUpAndTearDown();
	afterEach(async () => {
		await clearDb();
	});

	it('should add a category ', async () => {
		const example = 'category 1';
		const doc = await Metadata.getSingleton();
		await doc.addCategory(example);
		const retrieved = await Metadata.getSingleton();
		ensureArrayContains(retrieved.categories, example);
	});
	it('should add a brand ', async () => {
		const example = 'brand 1';
		const doc = await Metadata.getSingleton();
		await doc.addBrand(example);
		const retrieved = await Metadata.getSingleton();
		ensureArrayContains(retrieved.brands, example);
	});
});
