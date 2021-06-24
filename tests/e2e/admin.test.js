const { startApp, closeApp, getNewDriverInstance } = require('./config');
const path = require('path');

const {
	generateStringSizeN,
	generateMongooseId,
} = require('../utils/generalUtils/utils');
const { verifyEqual, verifyTruthy } = require('../utils/testsUtils');

const { clearDb, clearModel } = require('../utils/generalUtils').database;

const {
	Page,
	session,
	utilLogin,
	generalUtils,
	ProductPage,
} = require('./utils');
const {
	ensureHasTitleAndInfo,
	ensureHasTitleAndError,
} = require('./utils/generalUtils');
const { product } = require('../../config/constraints');
const { Product } = require('../../database/models');
const {
	createTestProducts,
	createDocForType,
} = require('../utils/generalUtils/database');
const { By } = require('selenium-webdriver');
const { ensureObjectsHaveSameFields } = require('../models/utils');
const { ensureHasTitle } = generalUtils;

const MAX_SETUP_TIME = 25000;
const MAX_TESTING_TIME = 20000;

const PORT = 8080;
const base = `http://localhost:${PORT}`;

const data = {
	name: 'John Doe',
	email: 'johndoe@email.com',
	password: 'JDoe787@?',
};
const logInUrl = `${base}/auth/admin/log-in`;
let page;

const validProduct = {
	title: 'test 1',
	file: path.resolve('tests/data/images/199707738.jpg'),
	buyingPrice: 69.99,
	percentageProfit: 20,
	quantity: 200,
	brand: 'The good Brand',
	category: 'clothing',
	description: 'The product was very good I  loved it.',
};

const invalidProduct = {
	title: 'te',
	file: path.resolve('tests/data/images/199707738.jpg'),
	buyingPrice: 69.99,
	percentageProfit: 20,
	quantity: 200,
	brand: 'The good Brand',
	category: 'clothing',
	description: 'The product was very good I  loved it.',
};
describe('Auth', () => {
	let admin;
	beforeAll(async () => {
		await startApp(PORT);
		page = new Page(getNewDriverInstance());
		admin = await utilLogin(page, logInUrl, data, 'admin');
		await ensureHasTitle(page, 'Your Products');
	}, MAX_SETUP_TIME);
	afterAll(async () => {
		await page.close();
		await clearDb();
		await session.clearSessions();
		await closeApp();
	});

	describe('Add Product', () => {
		beforeEach(async () => {
			const url = `${base}/admin/add-product`;
			await page.openUrl(url);
		});
		afterEach(async () => {
			await clearModel(Product);
		});
		it(
			'should upload a product ',
			async () => {
				await enterProductData(validProduct);
				await ensureHasTitleAndInfo(
					page,
					'Your Products',
					'Product added successfully.'
				);
				await ensureProductExistUsingItsTitle(validProduct.title);
			},
			MAX_TESTING_TIME
		);
		it(
			'should refuse if the product data is incorrect ',
			async () => {
				await enterProductData(invalidProduct);
				await ensureHasTitleAndError(
					page,
					'Add Product',
					`${product.title.error}`
				);
				//errernous products should not be added to the database.
				await ensureProductDoesNotExistUsingItsTitle(invalidProduct.title);
			},
			MAX_TESTING_TIME
		);
	});
	describe('Edit Product', () => {
		let created;
		beforeEach(async () => {
			created = (await createTestProducts([admin.id], 3))[0];
			const url = `${base}/admin/products`;
			await page.openUrl(url);
			await clickOneEdit();
		});
		afterEach(async () => {
			await clearModel(Product);
		});
		it(
			'should update for correct data',
			async () => {
				await page.hold(400);
				await enterProductData(validProduct);
				await ensureHasTitleAndInfo(
					page,
					'Your Products',
					'Product updated successfully.'
				);

				const update = await findProductByTitle(validProduct.title);
				ensureObjectsHaveSameFields(update, validProduct, [
					'title',
					'description',
				]);
			},
			MAX_TESTING_TIME
		);

		it(
			'should  refuse for invalid data',
			async () => {
				await page.hold(400);
				await enterProductData(invalidProduct);
				await ensureHasTitleAndError(page, 'Edit Product', product.title.error);
				const retrieved = await Product.findById(created.id);
				//ensure product data is not updated
				ensureObjectsHaveSameFields(retrieved, created, [
					'title',
					'description',
					'buyingPrice',
				]);
			},
			MAX_TESTING_TIME
		);
	});

	async function enterProductData(product) {
		const prodPage = new ProductPage(page);
		await prodPage.enterTitle(product.title);
		await prodPage.chooseFIle(product.file);
		await prodPage.enterBuyingPrice(product.buyingPrice);
		await prodPage.enterPercentageProfit(product.percentageProfit);
		await prodPage.enterQuantity(product.quantity);
		await prodPage.enterBrand(product.brand);
		await prodPage.enterCategory(product.category);
		await prodPage.enterDescription(product.description);
		await prodPage.submit();
	}
	async function clickOneEdit() {
		const articles = await page.getELements('article');
		await articles[0].findElement(By.className(`edit_product`)).click();
	}
});

async function ensureProductExistUsingItsTitle(title) {
	expect(await findProductByTitle(title)).not.toBeNull();
}
async function ensureProductDoesNotExistUsingItsTitle(title) {
	expect(await findProductByTitle(title)).toBeNull();
}
async function findProductByTitle(title) {
	return await Product.findOne({ title });
}
