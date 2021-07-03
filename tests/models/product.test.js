const { Product, Metadata } = require('../../database/models');
const { PRODUCTS_PER_PAGE } = require('../../config/env');

const {
	verifyEqual,
	verifyRejectsWithError,
	verifyNull,
	verifyTruthy,
	ensureMongooseArraysAreEqual,
	ensureArrayContains,
	verifyIDsAreEqual,
	ensureObjectHasKeyValuePair,
} = require('../utils/testsUtils');

const {
	createTestProducts,
	clearDb,
} = require('../utils/generalUtils/database');
const {
	generateMongooseId,
	generateStringSizeN,
	returnObjectWithoutProp,
	generateRandomIntInRange,
	generateRandomFloatInRange,
	generateRandomMongooseIds,
} = require('../utils/generalUtils/utils');
const { product } = require('../../config/constraints');
const {
	ranges,
	includeSetUpAndTearDown,
	ValidationError,
	mergeBintoA,
	ensureObjectsHaveSameFields,
	productProps,
	validateStringField,
	validateFloatField,
} = require('./utils');

const prodRanges = product;

const MAX_SETUP_TIME = 20000;

describe('--Product', () => {
	includeSetUpAndTearDown();
	afterEach(async () => {
		await clearDb();
	});
	const { createOne } = Product;
	describe('CreateOne', () => {
		const valid = generatePerfectProductData();
		const strings = ['title', 'imageUrl', 'description', 'category', 'brand'];
		for (const field of strings) {
			describe(field, () => {
				const otherFields = returnObjectWithoutProp(valid, field);
				const { minlength, maxlength } = prodRanges[field];
				const data = {
					func: createOne,
					field,
					minlength,
					maxlength,
					otherFields,
					err: ValidationError,
				};
				validateStringField(data);
			});
		}
		const numerics = ['buyingPrice', 'percentageProfit', 'quantity'];
		for (const field of numerics) {
			describe(field, () => {
				const otherFields = returnObjectWithoutProp(valid, field);
				const { min, max } = prodRanges[field];
				const data = {
					func: createOne,
					field,
					lowerlimit: min,
					upperlimit: max,
					otherFields,
					err: ValidationError,
				};
				validateFloatField(data);
			});
		}

		describe('should add both category and brand to the metadata table ', () => {
			let productData;
			beforeEach(async () => {
				productData = generatePerfectProductData();
				await createOne(productData);
			});
			it('ensure that both categories and brand are added to metadata', async () => {
				await ensureMetadataIsAdded(productData);
			});
		});

		it('ensure selling price is calculated', async () => {
			const created = await createOne(valid);
			ensureHasValidSellingPrice(created, valid);
		});

		describe('AdminId', () => {
			it('invalid', async () => {
				const field = 'adminId';
				const invalid = generateStringSizeN(ranges.mongooseId);
				const body = returnObjectWithoutProp(valid, field);
				body[field] = invalid;
				await verifyRejectsWithError(async () => {
					await Product.createOne(body);
				}, ValidationError);
			});
			it('valid', async () => {
				//props has all the desired fields
				//including the adminId, if function
				//does not throw then it accepts valid
				//adminIds.
				await expect(Product.createOne(valid)).resolves.not.toThrow();
			});
		});
	});
	describe('After creation', () => {
		describe('Statics', () => {
			describe('findProductsForPage', () => {
				const lowerlimit = 1;
				const upperlimit = 200;
				const err = `Page should range from ${lowerlimit} to ${upperlimit}`;
				validateInputField(lowerlimit, upperlimit, err);

				it('should return null on empty database', async () => {
					await expect(Product.findProductsForPage(1)).resolves.toBeNull();
				});
				describe('NonEmpty db', () => {
					const TRIALS = 200;
					let adminIds;
					beforeAll(async () => {
						//an admin will have many products, hence the
						//number of admins should be less than no of
						//products generated.
						adminIds = generateRandomMongooseIds(Math.floor(TRIALS / 4));
						await createTestProducts(adminIds, TRIALS);
					});
					afterAll(async () => {
						await clearDb();
					});
					it('returns products for first page ', async () => {
						const first = 1;
						const { products, paginationData } =
							await Product.findProductsForPage(first);
						ensureArrayHasLength(products, PRODUCTS_PER_PAGE);
						//the retrieved products should have quantity greater than zero.
						ensureEachProductHasPositiveQuantity(products);
						await validatePaginationData(first, paginationData);
					});
					it('returns products for last page ', async () => {
						const last = Math.floor(TRIALS / PRODUCTS_PER_PAGE);
						const { products, paginationData } =
							await Product.findProductsForPage(last);
						ensureArrayHasLength(products, PRODUCTS_PER_PAGE);
						ensureEachProductHasPositiveQuantity(products);
						const quantityGreaterThanZero = { quantity: { $gt: 0 } };
						await validatePaginationData(
							last,
							paginationData,
							quantityGreaterThanZero
						);
					});
					it('returns null for invalid pages ', async () => {
						const invalid = Math.floor(TRIALS / PRODUCTS_PER_PAGE) + 1;
						const productsData = await Product.findProductsForPage(invalid);
						verifyNull(productsData);
					});
				});
				//the function should not be here,instead a global functiion that
				//takes the funtion to test(e.g Product.findProductForPage) should
				//be used to test int variable. Tried that but jest had problems.
				function validateInputField(lowerlimit, upperlimit, err) {
					const field = 'Page';
					it(`reject ${field} non-numeric`, async () => {
						await ensureThrows('text');
					});
					it(`reject ${field} floats`, async () => {
						await ensureThrows(1.1);
					});
					describe(`reject ${field} < ${lowerlimit} and  > ${upperlimit} long.`, () => {
						it(`< ${lowerlimit}`, async () => {
							await ensureThrows(lowerlimit - 1);
						});
						it(`> ${upperlimit}`, async () => {
							await ensureThrows(upperlimit + 1);
						});
					});
					it(`does not throw on valid ${field}`, async () => {
						await ensureDoesNotThrow(lowerlimit);
						await ensureDoesNotThrow(upperlimit);
					});

					const ensureThrows = async data => {
						return await expect(
							Product.findProductsForPage(data)
						).rejects.toThrow(err);
					};
					const ensureDoesNotThrow = async data => {
						return await expect(
							Product.findProductsForPage(data)
						).resolves.not.toThrow();
					};
				}
			});
			describe('findCategories', () => {
				it('return null on empty db', async () => {
					const categories = await Product.findCategories();
					verifyEqual(categories.length, 0);
				});
				describe('non Empty db', () => {
					const category = 'category1';
					beforeAll(async () => {
						const productData = generatePerfectProductData();
						productData.category = category;
						await createOne(productData);
					}, MAX_SETUP_TIME);
					afterAll(async () => {
						await clearDb();
					});
					it('return all categories', async () => {
						const actual = await Product.findCategories();
						ensureArrayContains(actual, category);
					});
				});
			});
			describe.only('findCategoriesforAdminId', () => {
				let adminId = generateMongooseId();
				it('return null on empty db', async () => {
					const categories = await Product.findCategoriesForAdminId(adminId);
					verifyEqual(categories.length, 0);
				});
				describe('non Empty db', () => {
					const example = {
						category: 'category 1',
						adminId,
					};
					beforeAll(async () => {
						const productData = generatePerfectProductData();
						productData.category = example.category;
						productData.adminId = adminId;
						await createOne(productData);
					}, MAX_SETUP_TIME);
					afterAll(async () => {
						await clearDb();
					});
					it('return all for adminId', async () => {
						const actual = await Product.findCategoriesForAdminId(adminId);
						ensureArrayContains(actual, example.category);
					});
				});
			});

			describe('findCategoryProductsForAdminIdAndPage', () => {
				let adminId = generateMongooseId();
				it('returns empty array on empty db', async () => {
					const page = 1;
					const retrieved = await Product.findCategoryProductsForAdminIdAndPage(
						adminId,
						page
					);
					verifyEqual(retrieved.products.length, 0);
				});
				describe('non empty db', () => {
					afterEach(async () => {
						await clearDb();
					});
					it('should filter out products for admin Id', async () => {
						const testCategory = 'category 1';
						const product1 = generatePerfectProductData();
						product1.adminId = adminId;
						product1.category = testCategory;
						const product2 = generatePerfectProductData();
						product2.adminId = adminId;
						product2.category = testCategory;

						const product3 = generatePerfectProductData();
						product3.adminId = adminId;
						product3.category = 'some category';
						const product4 = generatePerfectProductData();
						product4.adminId = generateMongooseId();
						const products = [product1, product2, product3, product4];
						for (const product of products) {
							await Product.createOne(product);
						}

						const page = 1;
						const retrieved =
							await Product.findCategoryProductsForAdminIdAndPage(
								adminId,
								testCategory,
								page
							);
						const retrievedProducts = retrieved.products;
						verifyEqual(retrievedProducts.length, 2);
						ensureProductsHaveAdminId(retrievedProducts, adminId);
						const paginationData = retrieved.paginationData;
						ensureObjectHasKeyValuePair(paginationData, 'currentPage', page);
					});

					it('should lender upto to the PRODUCTS_PER_PAGE limit', async () => {
						const num = 50;
						const category = 'category 1';
						await createProductsWithAdminIdAndCategory(num, adminId, category);
						const page = 2;
						const retrieved =
							await Product.findCategoryProductsForAdminIdAndPage(
								adminId,
								category,
								page
							);
						const retrievedProducts = retrieved.products;
						ensureProductsHaveAdminId(retrievedProducts, adminId);
						verifyEqual(retrievedProducts.length, PRODUCTS_PER_PAGE);
						ensureObjectHasKeyValuePair(
							retrieved.paginationData,
							'hasNextPage',
							true
						);
					});
				});
			});
			describe('findCategoryProductsForPage', () => {
				describe('throws when either of the input are invalid', () => {
					describe('category', () => {
						const minlength = 5;
						const maxlength = 200;
						const err = `Category should be ${minlength} to ${maxlength} characters long.`;
						const testData = {};
						testData.minlength = minlength;
						testData.maxlength = maxlength;
						testData.otherFields = {
							page: 1,
						};
						testData.err = err;
						validateStringField(testData);
					});
					describe('Page', () => {
						const min = 1;
						const max = 200;
						const err = `Page should range from ${min} to ${max}`;
						const testData = {};
						testData.min = min;
						testData.max = max;
						testData.otherFields = {
							category: 'category 1',
						};
						testData.err = err;
						validateIntField(testData);
					});
					function validateStringField(testData) {
						const field = 'category';
						const minlength = testData.minlength;
						const maxlength = testData.maxlength;
						const otherFields = testData.otherFields;
						const err = testData.err;
						it(`reject ${field} non-string`, async () => {
							await ensureThrows([1, 2]);
						});
						describe(`reject ${field} < ${minlength} and  > ${maxlength} long.`, () => {
							it(`< ${minlength}`, async () => {
								await ensureThrows(generateStringSizeN(minlength - 1));
							});
							it(`> ${maxlength}`, async () => {
								await ensureThrows(generateStringSizeN(maxlength + 1));
							});
						});
						it(`does not throw on valid ${field}`, async () => {
							await ensureDoesNotThrow(generateStringSizeN(minlength));
							await ensureDoesNotThrow(generateStringSizeN(maxlength));
						});
						const ensureThrows = async data => {
							//else we need to append the other fields into the param object
							let input = createArguementObject(field, data, otherFields);
							await expect(
								Product.findCategoryProductsForPage(input)
							).rejects.toThrow(err);
						};
						const ensureDoesNotThrow = async data => {
							let input = createArguementObject(field, data, otherFields);
							return await expect(
								Product.findCategoryProductsForPage(input)
							).resolves.not.toThrow();
						};
						const createArguementObject = (field, data, otherFields) => {
							const arg = {};
							arg[field] = data;
							return mergeBintoA(arg, otherFields);
						};
					}
					function validateIntField(testData) {
						const field = 'page';
						const max = testData.max;
						const min = testData.min;
						const otherFields = testData.otherFields;
						const err = testData.err;
						it(`reject ${field}  is non-float`, async () => {
							await ensureThrows([1, 2]);
						});
						describe(`reject ${field} < ${min} and  > ${max}`, () => {
							it(`< ${min}`, async () => {
								await ensureThrows(min - 1);
							});
							it(`> ${max}`, async () => {
								await ensureThrows(max + 1);
							});
						});
						it(`does not throw on valid ${field}`, async () => {
							await ensureDoesNotThrow(max);
							await ensureDoesNotThrow(min);
						});
						const ensureThrows = async data => {
							//else we need to append the other fields into the param object
							let input = createArguementObject(field, data, otherFields);
							await expect(
								Product.findCategoryProductsForPage(input)
							).rejects.toThrow(err);
						};
						const ensureDoesNotThrow = async data => {
							let input = createArguementObject(field, data, otherFields);
							return await expect(
								Product.findCategoryProductsForPage(input)
							).resolves.not.toThrow();
						};
						const createArguementObject = (field, data, otherFields) => {
							const arg = {};
							arg[field] = data;
							return mergeBintoA(arg, otherFields);
						};
					}
				});
				it('should return null when database is empty.', async () => {
					const input = {
						category: 'category1',
						page: 1,
					};
					await expect(
						Product.findCategoryProductsForPage(input)
					).resolves.toBeNull();
				});
				describe('Non Empty database', () => {
					const categories = [
						'category1',
						'categoty2',
						'category3',
						'category4',
					];
					const TRIALS = 200;
					let adminIds;
					let products;
					beforeAll(async () => {
						adminIds = generateRandomMongooseIds(Math.floor(TRIALS / 4));
						products = await createTestProducts(adminIds, TRIALS);
						await modifyProductsCategories(products, categories);
					});
					afterAll(async () => {
						await clearDb();
					});
					it('returns products for first page ', async () => {
						const page = 1;
						for (const category of categories) {
							const query = {
								category,
								page,
							};
							const { products, paginationData } =
								await Product.findCategoryProductsForPage(query);
							ensureArrayHasLength(products, PRODUCTS_PER_PAGE);
							ensureEachProductHasPositiveQuantity(products);
							ensureEachProductHasCategory(products, category);
							await validatePaginationData(page, paginationData, { category });
						}
					});
					it('returns products for last page ', async () => {
						const page = Math.floor(
							TRIALS / (PRODUCTS_PER_PAGE * categories.length)
						);
						for (const category of categories) {
							const query = {
								category,
								page,
							};
							const { products, paginationData } =
								await Product.findCategoryProductsForPage(query);
							ensureArrayHasLength(products, PRODUCTS_PER_PAGE);
							ensureEachProductHasPositiveQuantity(products);
							ensureEachProductHasCategory(products, category);
							await validatePaginationData(page, paginationData, { category });
						}
					});
					it('returns null if the category is not in db', async () => {
						const query = {
							category: 'category 5',
							page: 1,
						};
						await expect(
							Product.findCategoryProductsForPage(query)
						).resolves.toBeNull();
					});
				});
			});
		});
		describe('Methods', () => {
			let product;
			beforeEach(async () => {
				product = (await createTestProducts([generateMongooseId()], 1))[0];
			});
			describe('update', () => {
				it('should update correct data', async () => {
					const update = {
						title: 'test 1',
						imageUrl: 'image/to/some/path.jpg',
						buyingPrice: 1000,
						percentageProfit: 20,
						quantity: 200,
						brand: 'The good Brand',
						category: 'clothing',
						description: 'The product was very good I  loved it.',
					};
					const updated = await product.updateDetails(update);
					ensureObjectsHaveSameFields(updated, update, productProps);
					ensureHasValidSellingPrice(updated, update);
					await ensureMetadataIsAdded(update);
				});
			});
		});
	});
});

function ensureProductsHaveAdminId(products, adminId) {
	for (const product of products) {
		verifyIDsAreEqual(adminId, product.adminId);
	}
}

async function ensureMetadataIsAdded(dataUsedDuringCreation) {
	const metadata = await getMetadata();
	const { brands, categories } = metadata;
	let brandExists = false;
	for (const brand of brands) {
		if (brand.brand === dataUsedDuringCreation.brand) brandExists = true;
	}
	verifyTruthy(brandExists);
	let categoryExists = false;
	for (const category of categories) {
		if (category.category === dataUsedDuringCreation.category)
			categoryExists = true;
	}
	verifyTruthy(categoryExists);
}

function ensureHasValidSellingPrice(created, dataUsedDuringCreation) {
	const { percentageProfit, buyingPrice } = dataUsedDuringCreation;
	expect(created.sellingPrice).toBe(
		Number((buyingPrice * (1 + percentageProfit / 100)).toFixed(2))
	);
}

function ensureEachProductHasPositiveQuantity(prods) {
	prods.forEach(prod => {
		expect(prod.quantity).toBeGreaterThan(0);
	});
}
function ensureEachProductHasCategory(prods, category) {
	prods.forEach(prod => {
		expect(prod.category).toBe(category);
	});
}

async function modifyProductsCategories(products, categories) {
	const noOfCategories = categories.length;
	const noOfProducts = products.length;

	let product;
	for (let i = 0; i < noOfProducts; i++) {
		product = products[i];

		product.category = categories[i % noOfCategories];
		await product.save();
	}
}

async function createProductsWithAdminIdAndCategory(num, adminId, category) {
	let product;
	const products = [];
	for (let i = 0; i < num; i++) {
		product = generatePerfectProductData();
		product.adminId = adminId;
		product.category = category;
		product = await Product.createOne(product);
		products.push(product);
	}
	return products;
}
function generatePerfectProductData() {
	const title = generateStringSizeN(prodRanges.title.minlength);
	const imageUrl = generateStringSizeN(prodRanges.imageUrl.minlength);

	const buyingPrice = generateRandomFloatInRange(
		prodRanges.buyingPrice.min,
		prodRanges.buyingPrice.max
	);
	const percentageProfit = generateRandomFloatInRange(
		prodRanges.percentageProfit.min,
		prodRanges.percentageProfit.max
	);
	const description = generateStringSizeN(prodRanges.description.minlength);
	const quantity = generateRandomIntInRange(
		prodRanges.quantity.min,
		prodRanges.quantity.max
	);
	const adminId = generateMongooseId();
	const category = generateStringSizeN(prodRanges.category.minlength);
	const brand = generateStringSizeN(prodRanges.brand.minlength);
	return {
		title,
		imageUrl,
		buyingPrice,
		percentageProfit,
		description,
		quantity,
		adminId,
		category,
		brand,
	};
}

async function getMetadata(params) {
	return await Metadata.getSingleton();
}
