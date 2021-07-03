const path = require('path');

const { startApp, closeApp, getNewDriverInstance } = require('./config');

const {
	deleteAllCreatedImages,
	generateRandomProductData,
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
const { Product, Metadata } = require('../../database/models');
const {
	createTestProducts,
	createDocForType,
	createAdminSalesTestDataForAdminId,
	feedProductsWithTestCategories,
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
	buyingPrice: 200.0,
	percentageProfit: 20,
	quantity: 200,
	brand: 'The good Brand',
	category: 'clothing',
	description: 'The product was very good I  loved it.',
};

const invalidProduct = {
	title: 'te',
	file: path.resolve('tests/data/images/199707738.jpg'),
	buyingPrice: 300.0,
	percentageProfit: 20,
	quantity: 200,
	brand: 'The good Brand',
	category: 'clothing',
	description: 'The product was very good I  loved it.',
};
let admin;
describe('Admin logged in routes', () => {
	beforeAll(async () => {
		await startApp(PORT);
		page = new Page(getNewDriverInstance());
		admin = await utilLogin(page, logInUrl, data, 'admin');
		await ensureHasTitle(page, 'Your Products');
	}, MAX_SETUP_TIME);
	afterAll(async () => {
		await page.close();
		await clearDb();
		await deleteAllCreatedImages();
		await session.clearSessions();
		await closeApp();
	});
	describe('Should be able to click links', () => {
		let products;
		const productsUrl = `${base}/admin/products`;
		beforeEach(async () => {
			products = await createTestProducts([admin.id], 3);
			await page.openUrl(productsUrl);
		});
		afterEach(async () => {
			await clearModel(Product);
		});
		it.only(
			'should click category links',
			async () => {
				const categories = ['category 1'];
				await clearModel(Product);
				await clearModel(Metadata);
				const product = { ...validProduct };
				product.category = categories[0];
				product.adminId = admin.id;
				product.imageUrl = 'some/path/to/some/image.jpg';
				await Product.createOne(product);
				for (const category of categories) {
					//reload incase the there are errors.
					await page.openUrl(productsUrl);
					await page.clickLink(category);
					const title = await page.getTitle();
					expect(title).toEqual(category);
				}
			},
			MAX_TESTING_TIME
		);

		//Tests for checking that products are rendered are left out.
		//When this test suite  is run, the developer will see if the product data is rendered or not.
		it(
			'should click a pagination link ',
			async () => {
				await page.clickLink('1');
				//the passing of this test is that it should not throw.
			},
			MAX_TESTING_TIME
		);
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
		//TODO add to test to ensure that that editing comes with the previous data
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

	it(
		'Should be able to see  their sales',
		async () => {
			const numOfProducts = 20;
			await createAdminSalesTestDataForAdminId(
				admin.id,
				await createTestProducts([admin.id], numOfProducts)
			);
			await page.openUrl(`${base}/admin/get-admin-sales`);
			const articles = await page.getELements('article');
			const firstArticle = articles[0];

			//ensure title is rendered.
			const text = await firstArticle
				.findElement(By.className('card__header'))
				.getText();
			//the test data contains the word 'title'
			verifyTruthy(text.indexOf('title') == 0);

			//ensure both the total and the profit are rendered .
			const salesDataSections = await firstArticle.findElement(
				By.className('card__content')
			);
			const paragraphs = await salesDataSections.findElements(By.css('p'));
			const profit = await paragraphs[0].getText();
			const total = await paragraphs[1].getText();
			const currencyIndicator = 'Kshs ';
			verifyTruthy(
				profit.indexOf(currencyIndicator) == 0 &&
					total.indexOf(currencyIndicator) == 0
			);
		},
		MAX_TESTING_TIME
	);

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
