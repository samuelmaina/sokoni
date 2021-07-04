const { User, Product, Metadata } = require('../../database/models');
const { startApp, getNewDriverInstance, closeApp } = require('./config');

async function addTRIALProductsToCart(user, products, TRIALS) {
	for (const product of products) {
		await user.addProductsToCart(product.id, TRIALS);
	}
}
async function resetCart(id) {
	const user = await User.findById(id);
	user.cart = [];
	return await user.save();
}

const { Page, utilLogin, session } = require('./utils');
const {
	clearModel,
	clearDb,
	createTestProducts,
} = require('../utils/generalUtils/database');
const {
	generateMongooseId,
	generatePerfectProductData,
} = require('../utils/generalUtils/utils');
const {
	ensureHasTitle,
	ensureHasTitleAndInfo,
	clearModelsInProductTests,
	ensureHasTitleAndError,
	includeTearDowns,
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

	afterEach(clearModelsInProductTests);
	it(
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
			await clickAddToCart();
			await page.clickLink('Continue Shopping');
			await ensureHasTitle(page, 'Products');
		},
		MAX_TEST_PERIOD
	);

	describe('cart operations', () => {
		afterEach(async () => {
			await resetCart(user.id);
			await clearModelsInProductTests();
		});

		describe('Addition to cart', () => {
			it(
				'should be able to add quantity and the push to cart',
				async () => {
					const quantity = 4,
						buyingPrice = 200.3;
					await generateOneProductWithQuantityAndBuyingPrice(
						quantity,
						buyingPrice
					);
					//reload since the product in the database have changed.
					await page.openUrl(homePage);
					await clickAddToCart();
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
				'should refuse when user enter quantity greater than the present quantity ',
				async () => {
					await clearModelsInProductTests();
					const product = generatePerfectProductData();
					const presentQuantity = product.quantity;
					await Product.createOne(product);
					//reload since the product in the database have changed.
					await page.openUrl(homePage);
					await clickAddToCart();
					await page.enterDataByName('quantity', presentQuantity + 1);
					await page.clickByClassName('push-to-cart-btn');
					await ensureHasTitleAndError(
						page,
						'Add To Cart',
						`On stock quantity is ${presentQuantity}.Please request less quantity`
					);

					const savedUser = await User.findById(user.id);
					//ensure product is not added to cart
					verifyEqual(savedUser.cart.length, 0);
				},
				MAX_TEST_PERIOD
			);

			it(
				'should refuse when user does not have enough balance ',
				async () => {
					const testQuantity = 7,
						buyingPrice = 200.3;
					const product = await generateOneProductWithQuantityAndBuyingPrice(
						testQuantity,
						buyingPrice
					);

					const savedUser = await User.findById(user.id);
					const { quantity, sellingPrice } = product;
					//we want to  add a product to the database twice.
					//reduce the balance by 1 from the total in the cart
					const newBalance = (quantity - 1) * sellingPrice - 1;
					savedUser.balance = newBalance;
					await savedUser.save();
					for (let i = 0; i < 2; i++) {
						await page.openUrl(homePage);
						await clickAddToCart();
						await page.enterDataByName('quantity', 3);
						await page.clickByClassName('push-to-cart-btn');
					}

					await ensureHasTitleAndError(
						page,
						'Add To Cart',
						`Dear customer you don't have enough balance to complete this transaction. Please reduce your quantity or recharge Kshs ${(1).toFixed(
							2
						)} in your account and try again.`
					);
					const retrieved = await User.findById(user.id);
					//ensure the second product is not added to cart and the balance is not reduced
					//for the second addition.
					verifyEqual(retrieved.cart.length, 1);
					verifyEqual(
						retrieved.balance,
						Number((newBalance - 3 * sellingPrice).toFixed(2))
					);
				},
				MAX_TEST_PERIOD
			);
		});

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
				await addTRIALProductsToCart(testUser, products, TRIALS);
				await page.openUrl(`${base}/cart`);
				await page.clickById('order-now');
				await ensureHasTitle(page, 'Your Orders');
			},
			MAX_TEST_PERIOD
		);
	});

	async function clickAddToCart() {
		await page.clickByClassName('add-to-cart-btn');
		await page.hold(400);
	}
});

async function generateOneProductWithQuantityAndBuyingPrice(
	quantity,
	buyingPrice
) {
	await clearModelsInProductTests();
	const productData = generatePerfectProductData();
	//the auto product generator is generating wierdly huge values.
	productData.quantity = quantity;
	productData.buyingPrice = buyingPrice;
	return await Product.createOne(productData);
}
