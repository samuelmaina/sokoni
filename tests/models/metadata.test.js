const { mongooseId } = require('../../config/constraints');
const { Metadata } = require('../../database/models');
const { clearDb } = require('../utils/generalUtils/database');
const {
	generateMongooseId,
	generateStringSizeN,
} = require('../utils/generalUtils/utils');
const {
	ensureArrayContains,
	verifyEqual,
	verifyIDsAreEqual,
	ensureMongooseArraysAreEqual,
	verifyRejectsWithError,
} = require('../utils/testsUtils');
const { includeSetUpAndTearDown, ValidationError, ranges } = require('./utils');

describe.skip('Metadata', () => {
	let doc;
	includeSetUpAndTearDown();
	beforeEach(async () => {
		doc = await fetchSingleton();
	});
	afterEach(async () => {
		await clearDb();
	});

	const categoryExample = {
		category: 'category 1',
		adminId: generateMongooseId(),
	};
	const brandExample = {
		brand: 'brand 1',
		adminId: generateMongooseId(),
	};

	describe('addCategory', () => {
		const { minlength, maxlength, error } = ranges.product.category;
		it('should for correct data', async () => {
			await doc.addCategory(categoryExample);
			const retrieved = await fetchSingleton();
			const categories = retrieved.categories;
			const firstCategory = categories[0];
			verifyEqual(firstCategory.category, categoryExample.category);
			verifyIDsAreEqual(firstCategory.adminIds[0], categoryExample.adminId);
		});
		it('should refuse if category missing', async () => {
			verifyRejectsWithError(async () => {
				await doc.addCategory({
					adminId: generateMongooseId(),
				});
			}, error);
		});

		it('should refuse if category invalid', async () => {
			verifyRejectsWithError(async () => {
				await doc.addCategory({
					adminId: generateMongooseId(),
					category: generateStringSizeN(minlength - 1),
				});
			}, error);
		});
		it('should reject if adminId missing or invalid', async () => {
			verifyRejectsWithError(async () => {
				await doc.addCategory({
					category: 'category 1',
				});
			}, mongooseId.error);
		});
	});

	it('should add a brand ', async () => {
		await doc.addBrand(brandExample);
		const retrieved = await fetchSingleton();
		const brands = retrieved.brands;
		const firstBrand = brands[0];
		verifyEqual(firstBrand.brand, brandExample.brand);
		verifyIDsAreEqual(firstBrand.adminIds[0], brandExample.adminId);
	});
	it('should clear the stored data', async () => {
		await doc.addCategory(categoryExample);
		await doc.addCategory(categoryExample);
		await doc.addBrand(brandExample);
		await doc.addBrand(brandExample);
		await doc.clear();
		const retrieved = await fetchSingleton();
		const { categories, brands } = retrieved;
		verifyEqual(categories.length, 0);
		verifyEqual(brands.length, 0);
	});

	it('should fetch all categories', async () => {
		const trial = 10;
		const categories = generateRandomCategories(trial);
		for (const category of categories) {
			await doc.addCategory(category);
		}
		const retrieved = doc.getAllCategories();
		for (const category of categories) {
			ensureArrayContains(retrieved, category.category);
		}
	});

	it('should fetch all categories for an adminId', async () => {
		const adminId = generateMongooseId();
		const categories = [
			{
				category: 'category 1',
				adminId,
			},
			{
				category: 'category 2',
				adminId,
			},
			{
				category: 'category 3',
				adminId,
			},
			{
				category: 'category 4',
				adminId: generateMongooseId(),
			},
		];
		for (const category of categories) {
			await doc.addCategory(category);
		}
		const retrieved = doc.getAllCategoriesForAdminId(adminId);
		verifyEqual(retrieved.length, 3);
		for (const category of categories) {
			if (category.adminId.toString() === adminId.toString())
				ensureArrayContains(retrieved, category.category);
		}
	});
});

function generateRandomCategories(num) {
	const categories = [];
	for (let i = 0; i < num; i++) {
		categories.push({
			category: `category ${i}`,
			adminId: generateMongooseId(),
		});
	}
	return categories;
}

async function fetchSingleton() {
	return await Metadata.getSingleton();
}
