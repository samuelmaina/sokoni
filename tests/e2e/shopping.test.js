const { User, Product } = require('../../database/models');
const { startApp, getNewDriverInstance, closeApp } = require('./config');

const { addTRIALProductsToCart, resetCart } = require('../models/user/util');

const { Page, utilLogin, session } = require('./utils');
const {
	clearModel,
	clearDb,
	createTestProducts,
} = require('../utils/generalUtils/database');
const { generateMongooseId } = require('../utils/generalUtils/utils');
const {
	ensureHasTitle,
	ensureHasTitleAndInfo,
} = require('./utils/generalUtils');
const { verifyEqual } = require('../utils/testsUtils');

const adminId = generateMongooseId();

const TRIALS = 10;

let page;

const MAX_TEST_PERIOD = 20000;

const PORT = 5000;
const base = `http://localhost:${PORT}`;
const homePage = `${base}/`;

const data = {
	name: 'Samuel Maina',
	email: 'samuelmayna@gmail.com',
	password: 'Smain68219?',
};
describe('logged in user can be able to shop', () => {
	let user;
	let products = [];
	beforeAll(async () => {
		await startApp(PORT);
		page = new Page(getNewDriverInstance());
		const userLoginUrl = `${base}/auth/user/log-in`;
		user = await utilLogin(page, userLoginUrl, data, 'user');
		await ensureHasTitle(page, 'Products');
	}, MAX_TEST_PERIOD);
	afterAll(async () => {
		await session.clearSessions();
		await page.close();
		await clearDb();
		await closeApp();
	});

	beforeEach(async () => {
		products = await createTestProducts([adminId], TRIALS);
		await page.openUrl(homePage);
	}, MAX_TEST_PERIOD);

	afterEach(async () => {
		await clearModel(Product);
	});

	test(
		'can add to cart',
		async () => {
			await page.clickByClassName('add-to-cart-btn');
			await ensureHasTitle(page, 'Add To Cart');
		},
		MAX_TEST_PERIOD
	);
	test(
		'should be able to click Continue Shopping',
		async () => {
			await page.clickByClassName('add-to-cart-btn');
			await page.hold(500);
			await page.clickLink('Continue Shopping');
			await ensureHasTitle(page, 'Products');
		},
		MAX_TEST_PERIOD
	);

	describe('cart operations', () => {
		afterEach(async () => {
			await resetCart(user.id);
		});

		it(
			'should be able to add quantity and the push to cart',
			async () => {
				await page.clickByClassName('add-to-cart-btn');
				await page.hold(400);
				await page.enterDataByName('quantity', 3);
				await page.clickByClassName('push-to-cart-btn');
				await ensureHasTitleAndInfo(
					page,
					'Products',
					'Product successfully added to cart.'
				);
				const savedUser = await User.findById(user.id);
				verifyEqual(savedUser.cart.length, 1);
				verifyEqual(savedUser.cart[0].quantity, 3);
			},
			MAX_TEST_PERIOD
		);
		it(
			'should be able view cart',
			async () => {
				await addTRIALProductsToCart(user, products, TRIALS);
				await page.clickLink('Cart');
				await ensureHasTitle(page, 'Your Cart');
			},
			MAX_TEST_PERIOD
		);

		it(
			'should be able order products',
			async () => {
				const testUser = await User.findOne({ name: user.name });
				addTRIALProductsToCart(testUser, products, TRIALS);
				await page.openUrl(`${base}/cart`);
				await page.clickById('order-now');
				await ensureHasTitle(page, 'Your Orders');
			},
			MAX_TEST_PERIOD
		);
	});
});
