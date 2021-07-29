// const path = require('path');

// const {
// 	startApp,
// 	closeApp,
// 	getNewDriverInstance,
// 	TEST_PORT,
// } = require('./config');

// const {
// 	deleteAllCreatedImages,
// 	generateRandomProductData,
// 	generatePerfectProductData,
// 	returnObjectWithoutProp,
// 	generateStringSizeN,
// } = require('../utils/generalUtils/utils');
// const {
// 	verifyEqual,
// 	verifyTruthy,
// 	ensureValueGreateThan,
// } = require('../utils/testsUtils');

// const { clearDb, clearModel } = require('../utils/generalUtils').database;

// const {
// 	Page,
// 	session,
// 	utilLogin,
// 	generalUtils,
// 	ProductPage,
// } = require('./utils');
// const {
// 	ensureHasTitleAndInfo,
// 	ensureHasTitleAndError,
// 	clearModelsInProductTests,
// 	clearSessions,
// } = require('./utils/generalUtils');
// const { product } = require('../../config/constraints');
// const { Product, Metadata } = require('../../database/models');
// const {
// 	createTestProducts,
// 	createDocForType,
// 	createAdminSalesTestDataForAdminId,
// 	feedProductsWithTestCategories,
// } = require('../utils/generalUtils/database');
// const { By } = require('selenium-webdriver');
// const { ensureObjectsHaveSameFields, ranges } = require('../models/utils');
// const { PRODUCTS_PER_PAGE } = require('../../config/env');
// const { ensureHasTitle } = generalUtils;

// const MAX_SETUP_TIME = 25000;
// const MAX_TESTING_TIME = 20000;

// const PORT = TEST_PORT;
// const base = `http://localhost:${PORT}`;

// const data = {
// 	name: 'John Doe',
// 	email: 'johndoe@email.com',
// 	password: 'JDoe787@?',
// };
// const logInUrl = `${base}/auth/admin/log-in`;
// let page;
// const validProduct = {
// 	title: 'test 1',
// 	file: path.resolve('tests/data/images/199707738.jpg'),
// 	buyingPrice: 200.34,
// 	percentageProfit: 20,
// 	quantity: 200,
// 	brand: 'The good Brand',
// 	category: 'clothing',
// 	description: 'The product was very good I  loved it.',
// };

// const invalidProduct = {
// 	title: 'te',
// 	file: path.resolve('tests/data/images/199707738.jpg'),
// 	buyingPrice: 300.25,
// 	percentageProfit: 20,
// 	quantity: 200,
// 	brand: 'The good Brand',
// 	category: 'clothing',
// 	description: 'The product was very good I  loved it.',
// };
// let admin;

// const productsUrl = `${base}/admin/products`;
// describe('When admin is logged activities', () => {
// 	beforeAll(async () => {
// 		await startApp(PORT);
// 		page = new Page(getNewDriverInstance());
// 		admin = await utilLogin(page, logInUrl, data, 'admin');
// 		await ensureHasTitle(page, 'Your Products');
// 	}, MAX_SETUP_TIME);
// 	afterAll(async () => {
// 		await page.close();
// 		await clearDb();
// 		await deleteAllCreatedImages();
// 		await clearSessions();
// 		await closeApp();
// 	});

// 	describe('Add Product', () => {
// 		beforeEach(async () => {
// 			await page.openUrl(`${base}/admin/add-product`);
// 		}, MAX_SETUP_TIME);
// 		afterEach(clearModelsInProductTests);
// 		it(
// 			'should upload a product ',
// 			async () => {
// 				await enterProductData(validProduct);
// 				await ensureHasTitleAndInfo(
// 					page,
// 					'Your Products',
// 					'Product added successfully.'
// 				);
// 				//ensure that produc is added to the database.
// 				await ensureProductExistUsingItsTitle(validProduct.title);
// 			},
// 			MAX_TESTING_TIME
// 		);
// 		let productData;
// 		let errorMessage;
// 		productData = { ...validProduct };
// 		productData.buyingPrice = '';
// 		errorMessage = 'buyingPrice must be a number.';
// 		runInvalidProductTest(
// 			'reject if  data is missing',
// 			productData,
// 			errorMessage
// 		);

// 		runInvalidProductTest(
// 			'should refuse if the product data is incorrect ',
// 			invalidProduct,
// 			product.title.error
// 		);

// 		it(
// 			'should prompt an admin to enter an image if they had not select one.',
// 			async () => {
// 				const prodPage = new ProductPage(page);
// 				await prodPage.enterTitle(validProduct.title);
// 				await prodPage.enterBuyingPrice(validProduct.buyingPrice);
// 				await prodPage.enterPercentageProfit(validProduct.percentageProfit);
// 				await prodPage.enterQuantity(validProduct.quantity);
// 				await prodPage.enterBrand(validProduct.brand);
// 				await prodPage.enterCategory(validProduct.category);
// 				await prodPage.enterDescription(validProduct.description);
// 				await prodPage.submit();
// 				await ensureHasTitleAndError(
// 					page,
// 					'Add Product',
// 					`Please enter an image for your product.`
// 				);
// 				await ensureProductDoesNotExistUsingItsTitle(validProduct.title);
// 			},
// 			MAX_TESTING_TIME
// 		);

// 		function runInvalidProductTest(testMessage, product, errorMessage) {
// 			it(
// 				testMessage,
// 				async () => {
// 					await enterProductData(product);
// 					await ensureHasTitleAndError(page, 'Add Product', errorMessage);
// 					//errernous products should not be added to the database.
// 					await ensureProductDoesNotExistUsingItsTitle(productData.title);
// 				},
// 				MAX_TESTING_TIME
// 			);
// 		}
// 	});
// 	describe('Edit Product', () => {
// 		//TODO add to test to ensure that that editing comes with the previous data
// 		let created;
// 		beforeEach(async () => {
// 			created = (await createTestProducts([admin.id], 3))[0];
// 			await page.openUrl(productsUrl);
// 			await clickOneEdit();
// 		});
// 		afterEach(clearModelsInProductTests);
// 		it(
// 			'should update for correct data',
// 			async () => {
// 				await enterProductData(validProduct);
// 				await ensureHasTitleAndInfo(
// 					page,
// 					'Your Products',
// 					'Product updated successfully.'
// 				);

// 				const update = await findProductByTitle(validProduct.title);
// 				ensureObjectsHaveSameFields(update, validProduct, [
// 					'title',
// 					'description',
// 				]);
// 			},
// 			MAX_TESTING_TIME
// 		);

// 		it(
// 			'should  refuse for invalid data',
// 			async () => {
// 				await page.hold(400);
// 				await enterProductData(invalidProduct);
// 				await ensureHasTitleAndError(page, 'Edit Product', product.title.error);
// 				const retrieved = await Product.findById(created.id);
// 				//ensure product data is not updated
// 				ensureObjectsHaveSameFields(retrieved, created, [
// 					'title',
// 					'description',
// 					'buyingPrice',
// 				]);
// 			},
// 			MAX_TESTING_TIME
// 		);
// 	});
// 	it(
// 		'should be able to delete  a product',
// 		async () => {
// 			const noOfProducts = 2;
// 			await createTestProducts([admin.id], noOfProducts);
// 			await page.openUrl(productsUrl);
// 			await clickOneDelete();
// 			await page.hold(100);
// 			const articles = await page.getELements('article');
// 			//ensure that the product is removed without reloading.
// 			verifyEqual(articles.length, 1);
// 			await page.hold(300);

// 			//ensure that the user is informed of the deletion when they reload.
// 			await page.openUrl(productsUrl);
// 			await ensureHasTitleAndInfo(
// 				page,
// 				'Your Products',
// 				'Product deleted successfully.'
// 			);

// 			const noOfDocs = await Product.find().countDocuments();
// 			verifyEqual(noOfDocs, noOfProducts - 1);
// 		},
// 		MAX_TESTING_TIME
// 	);

// 	describe('Should be able to click links', () => {
// 		let products;
// 		const productsUrl = `${base}/admin/products`;
// 		beforeEach(async () => {
// 			products = await createTestProducts([admin.id], 3);
// 			await page.openUrl(productsUrl);
// 		});
// 		afterEach(clearModelsInProductTests);
// 		describe('Category navigation', () => {
// 			it.only(
// 				'should click category links',
// 				async () => {
// 					const category = 'category 1';
// 					await clearModelsInProductTests();
// 					const product = { ...validProduct };
// 					product.category = category;
// 					product.adminId = admin.id;
// 					product.imageUrl = 'some/path/to/some/image.jpg';
// 					await Product.createOne(product);

// 					//reload incase the there are errors.
// 					await page.openUrl(productsUrl);
// 					await page.hold(200);
// 					await page.clickLink(category);
// 					const title = await page.getTitle();
// 					expect(title).toEqual(category);
// 				},
// 				MAX_TESTING_TIME
// 			);

// 			it(
// 				'should click a pagination for a category ',
// 				async () => {
// 					const categories = ['category 1', 'category 2'];
// 					await clearModelsInProductTests();
// 					for (const category of categories) {
// 						for (let i = 0; i < PRODUCTS_PER_PAGE * 1.5; i++) {
// 							const product = { ...validProduct };
// 							product.category = category;
// 							product.adminId = admin.id;
// 							product.imageUrl = 'some/path/to/some/image.jpg';
// 							await Product.createOne(product);
// 						}
// 					}

// 					for (const category of categories) {
// 						//reload incase the there are errors.
// 						await page.openUrl(productsUrl);
// 						await page.clickLink(category);
// 						await page.clickLink('2');
// 						const title = await page.getTitle();
// 						expect(title).toEqual(category);
// 						let articles = await page.getELements('article');
// 						verifyEqual(articles.length, PRODUCTS_PER_PAGE * 0.5);
// 					}
// 				},
// 				MAX_TESTING_TIME
// 			);

// 			it(
// 				'should refuse when category is out of range',
// 				async () => {
// 					const categoryRange = ranges.product.category;
// 					await page.openUrl(
// 						`${base}/admin/category/${generateStringSizeN(
// 							categoryRange.maxlength + 1
// 						)}/?page=1`
// 					);
// 					await ensureHasTitleAndError(
// 						page,
// 						'Your Products',
// 						categoryRange.error
// 					);
// 				},
// 				MAX_TESTING_TIME
// 			);
// 			it(
// 				'should refuse when page is out of range',
// 				async () => {
// 					const categoryRange = ranges.product.category;
// 					await page.openUrl(
// 						`${base}/admin/category/${generateStringSizeN(
// 							categoryRange.maxlength
// 						)}?page=${ranges.shop.page.max + 1}`
// 					);
// 					await ensureHasTitleAndError(
// 						page,
// 						'Your Products',
// 						ranges.shop.page.error
// 					);
// 				},
// 				MAX_TESTING_TIME
// 			);
// 		});

// 		//Tests for checking that products are rendered are left out.
// 		//When this test suite  is run, the developer will see if the product data is rendered or not.
// 		it(
// 			'should click a pagination link ',
// 			async () => {
// 				await clearDb();
// 				await createTestProducts([admin.id], PRODUCTS_PER_PAGE * 1.5);
// 				await page.clickLink('1');
// 				let articles = await page.getELements('article');
// 				verifyEqual(articles.length, PRODUCTS_PER_PAGE);
// 				await page.clickLink('2');
// 				articles = await page.getELements('article');
// 				verifyEqual(articles.length, PRODUCTS_PER_PAGE * 0.5);
// 			},
// 			MAX_TESTING_TIME
// 		);
// 	});

// 	it(
// 		'Should be able to see  their sales',
// 		async () => {
// 			const testTitle = 'title 1';
// 			let productData = generatePerfectProductData();
// 			productData.title = testTitle;
// 			await createAdminSalesTestDataForAdminId(admin.id, [
// 				await Product.createOne(productData),
// 			]);
// 			await page.openUrl(`${base}/admin/get-admin-sales`);
// 			const articles = await page.getELements('article');
// 			const firstArticle = articles[0];

// 			//ensure title is rendered.
// 			const text = await firstArticle
// 				.findElement(By.className('card__header'))
// 				.getText();
// 			//the test data contains the word 'title'
// 			ensureValueGreateThan(text.length, ranges.product.title.minlength);

// 			//ensure both the total and the profit are rendered .
// 			const salesDataSections = await firstArticle.findElement(
// 				By.className('card__content')
// 			);
// 			const paragraphs = await salesDataSections.findElements(By.css('p'));
// 			const profit = await paragraphs[0].getText();
// 			const total = await paragraphs[1].getText();
// 			const currencyIndicator = 'Kshs ';
// 			verifyTruthy(
// 				profit.indexOf(currencyIndicator) == 0 &&
// 					total.indexOf(currencyIndicator) == 0
// 			);
// 		},
// 		MAX_TESTING_TIME
// 	);

// 	async function enterProductData(product) {
// 		const prodPage = new ProductPage(page);
// 		await prodPage.enterTitle(product.title);
// 		await prodPage.chooseFIle(product.file);
// 		await prodPage.enterBuyingPrice(product.buyingPrice);
// 		await prodPage.enterPercentageProfit(product.percentageProfit);
// 		await prodPage.enterQuantity(product.quantity);
// 		await prodPage.enterBrand(product.brand);
// 		await prodPage.enterCategory(product.category);
// 		await prodPage.enterDescription(product.description);
// 		await prodPage.submit();
// 	}
// 	async function clickOneEdit() {
// 		const articles = await page.getELements('article');
// 		await articles[0].findElement(By.className(`edit_product`)).click();
// 	}
// 	async function clickOneDelete() {
// 		const articles = await page.getELements('article');
// 		await articles[0].findElement(By.className('delete')).click();
// 	}
// });

// async function ensureProductExistUsingItsTitle(title) {
// 	expect(await findProductByTitle(title)).not.toBeNull();
// }
// async function ensureProductDoesNotExistUsingItsTitle(title) {
// 	expect(await findProductByTitle(title)).toBeNull();
// }
// async function findProductByTitle(title) {
// 	return await Product.findOne({ title });
// }
