const { startApp, closeApp, getNewDriverInstance } = require('./config');
const path = require('path');

const { generateStringSizeN } = require('../utils/generalUtils/utils');
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
describe('Auth', () => {
	beforeAll(async () => {
		await startApp(PORT);
		page = new Page(getNewDriverInstance());
		await utilLogin(page, logInUrl, data, 'admin');
		await ensureHasTitle(page, 'Your Products');
	}, MAX_SETUP_TIME);
	afterAll(async () => {
		await page.close();
		await clearDb();
		await session.clearSessions();
		await closeApp();
	});

	describe('Add Products', () => {
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
				const valid = {
					title: 'test 1',
					file: path.resolve('tests/data/images/199707738.jpg'),
					bP: 69.99,
					pProfit: 20,
					quantity: 200,
					brand: 'The good Brand',
					category: 'clothing',
					description: 'The product was very good I  loved it.',
				};
				await enterProductData(valid);
				await ensureHasTitleAndInfo(
					page,
					'Your Products',
					'Product added successfully.'
				);
			},
			MAX_TESTING_TIME
		);
		it(
			'should refuse if the product data is incorrect ',
			async () => {
				const invalid = {
					title: 'te',
					file: path.resolve('tests/data/images/199707738.jpg'),
					bP: 69.99,
					pProfit: 20,
					quantity: 200,
					brand: 'The good Brand',
					category: 'clothing',
					description: 'The product was very good I  loved it.',
				};
				await enterProductData(invalid);
				await ensureHasTitleAndError(
					page,
					'Add Product',
					`${product.title.error}`
				);
			},
			MAX_TESTING_TIME
		);
	});
	async function enterProductData(product) {
		const prodPage = new ProductPage(page);
		await prodPage.enterTitle(product.title);
		await prodPage.chooseFIle(product.file);
		await prodPage.enterBuyingPrice(product.bP);
		await prodPage.enterPercentageProfit(product.pProfit);
		await prodPage.enterQuantity(product.quantity);
		await prodPage.enterBrand(product.brand);
		await prodPage.enterCategory(product.category);
		await prodPage.enterDescription(product.description);
		await prodPage.submit();
	}
});
