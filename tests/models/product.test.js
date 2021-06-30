const { Product, Metadata } = require('../../../database/models');

const { PRODUCTS_PER_PAGE } = require('../../../config/env');

const {
	verifyEqual,
	verifyRejectsWithError,
	verifyNull,
	ensureArrayContains,
	ensureArraysAr,
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
	afterEach(async () => {
		await clearDb();
	});
	const { createOne } = Product;
	describe('CreateOne', () => {
		const props = generatePerfectProductData();
		const strings = ['title', 'imageUrl', 'description', 'category', 'brand'];
		for (const field of strings) {
			describe(field, () => {
				const otherFields = returnObjectWithoutProp(props, field);
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
				const otherFields = returnObjectWithoutProp(props, field);
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
			beforeEach(() => {
				productData = generatePerfectProductData();
			});
			it('should add  category', async () => {
				await createOne(productData);
				const metadata = await Metadata.getSingleton();
				ensureArrayContains(metadata.categories, productData.category);
			});
			it('should add brand', async () => {
				await createOne(productData);
				const metadata = await Metadata.getSingleton();
				ensureArrayContains(metadata.brands, productData.brand);
			});
		});
		describe('AdminId', () => {
			it('invalid', async () => {
				const field = 'adminId';
				const invalid = generateStringSizeN(ranges.mongooseId);
				const body = returnObjectWithoutProp(props, field);
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
				await expect(Product.createOne(props)).resolves.not.toThrow();
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
					const categories = [
						'category1',
						'category2',
						'category3',
						'category4',
					];
					beforeAll(async () => {
						const trials = 200;
						for (let i = 0; i < trials; i++) {
							const productData = generatePerfectProductData();
							productData.category = categories[i % categories.length];
							await createOne(productData);
						}
					}, MAX_SETUP_TIME);
					afterAll(async () => {
						await clearDb();
					});
					it('return all categories', async () => {
						const actual = await Product.findCategories();
						ensureArraysAr(categories, actual);
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
						buyingPrice: 69.99,
						percentageProfit: 20,
						quantity: 200,
						brand: 'The good Brand',
						category: 'clothing',
						description: 'The product was very good I  loved it.',
					};
					const updated = await product.updateDetails(update);
					ensureObjectsHaveSameFields(updated, update, productProps);
					const { percentageProfit, buyingPrice } = update;
					expect(updated.sellingPrice).toBe(
						Number((buyingPrice * (1 + percentageProfit / 100)).toFixed(2))
					);
				});
			});
		});
	});
});

async function validatePaginationData(page, paginationData, query) {
	const total = await Product.find(query).countDocuments();
	const expected = {
		hasNextPage: page * PRODUCTS_PER_PAGE < total,
		hasPreviousPage: page > 1,
		nextPage: page + 1,
		previousPage: page - 1,
		lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
		currentPage: page,
	};
	verifyEqual(paginationData, expected);
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
