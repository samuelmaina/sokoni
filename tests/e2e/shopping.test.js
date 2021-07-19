const {
	User,
	Product,
	Metadata,
	AdminSales,
	Order,
} = require('../../database/models');
const {
	startApp,
	getNewDriverInstance,
	closeApp,
	TEST_PORT,
} = require('./config');

async function addTRIALProductsToCart(user, products, quantityToAddPerProduct) {
	for (const product of products) {
		await user.addProductsToCart(product.id, quantityToAddPerProduct);
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
	feedProductsWithTestCategories,
} = require('../utils/generalUtils/database');
const {
	generateMongooseId,
	generatePerfectProductData,
	generateStringSizeN,
} = require('../utils/generalUtils/utils');
const {
	ensureHasTitle,
	ensureHasTitleAndInfo,
	clearModelsInProductTests,
	ensureHasTitleAndError,
	includeTearDowns,
} = require('./utils/generalUtils');
const {
	verifyEqual,
	ensureValueGreateThan,
	ensureArrayContains,
	verifyIDsAreEqual,
	verifyFalsy,
} = require('../utils/testsUtils');
const { ranges } = require('../models/utils');
const { addProductIdToCart } = require('../../database/services/user');

const adminId = generateMongooseId();

const TRIALS = 10;

let page;

const MAX_TEST_PERIOD = 20000;

const PORT = TEST_PORT;
const base = `http://localhost:${PORT}`;
const homePage = `${base}/`;

const data = {
	name: 'John Doe ',
	email: 'johndoe@email.com',
	password: 'Pa55word?',
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
		await page.openUrl(base + '/products?page=1');
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

	describe('Category', () => {
		it(
			'should click category links',
			async () => {
				const categories = ['category 1', 'category 2', 'category 3'];
				await feedProductsWithTestCategories(products, categories);
				for (const category of categories) {
					//reload incase the there are errors.
					await page.openUrl(homePage);
					await page.clickLink(category);
					const title = await page.getTitle();
					expect(title).toEqual(category);
				}
			},
			MAX_TEST_PERIOD
		);
		it(
			'should refuse for invalid url params(should refuse when category is out of range)',
			async () => {
				const { maxlength, error } = ranges.product.category;
				await page.openUrl(
					`${base}/category/${generateStringSizeN(maxlength + 1)}?page=1`
				);
				await ensureHasTitleAndError(page, 'Products', error);
			},
			MAX_TEST_PERIOD
		);
	});
	it(
		'should click a pagination link ',
		async () => {
			await page.clickLink('1');
			//the passing of this test is that it should not throw.
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

		it(
			'should be able view cart',
			async () => {
				await addTRIALProductsToCart(user, products, TRIALS);
				await page.clickLink('Cart');
				await ensureHasTitle(page, 'Your Cart');
			},
			MAX_TEST_PERIOD
		);

		describe('Addition to cart', () => {
			it(
				'should be able to add quantity and the push to cart',
				async () => {
					const balance = (await User.findById(user.id)).balance;

					const quantity = 4,
						buyingPrice = 200.3;
					const product = await generateOneProductWithQuantityAndBuyingPrice(
						quantity,
						buyingPrice
					);
					//reload since the product in the database have changed.
					await page.openUrl(homePage);
					await clickAddToCart();
					const addedQuantity = 3;
					await page.enterDataByName('quantity', addedQuantity);
					await page.clickByClassName('push-to-cart-btn');
					await ensureHasTitleAndInfo(
						page,
						'Products',
						'Product successfully added to cart.'
					);
					const savedUser = await User.findById(user.id);
					verifyEqual(savedUser.cart.length, 1);
					verifyEqual(savedUser.cart[0].quantity, addedQuantity);
					//ensure balance is reduced.
					const newBalance = savedUser.balance;
					verifyEqual(
						newBalance,
						Number((balance - product.sellingPrice * addedQuantity).toFixed(2))
					);
					//ensure quantity is also reduced
					const savedProduct = await Product.findById(product.id);
					verifyEqual(savedProduct.quantity, quantity - addedQuantity);
				},
				MAX_TEST_PERIOD
			);
			it(
				'should be able to delete from cart',
				async () => {
					const balance = (await User.findById(user.id)).balance;
					const trials = 3;
					await addTRIALProductsToCart(user, products, trials);
					await page.clickLink('Cart');
					await page.clickByClassName('delete');
					await ensureHasTitle(page, 'Your Cart');
					const savedUser = await User.findById(user.id);
					verifyEqual(savedUser.cart.length, trials - 1);
					//balance is not changed
					const newBalance = savedUser.balance;
					verifyEqual(newBalance, balance);
					//ensure quantity is also reduced
					const savedProduct = await Product.findById(product.id);
					verifyEqual(savedProduct.quantity, trial - 1);
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
					//we want to  add a product to the cart twice.
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
			'should be able order products',
			async () => {
				const testUser = await User.findOne({ name: user.name });
				const product1 = products[0];
				const product2 = products[1];
				const productsToAdd = [product1, product2];
				const quantityToAddPerProduct = 1;
				await addTRIALProductsToCart(
					testUser,
					productsToAdd,
					quantityToAddPerProduct
				);
				await page.openUrl(`${base}/cart`);
				await page.clickById('order-now');
				await ensureHasTitle(page, 'Your Orders');
				await ensureUserCartIsCleared();
				await ensureSalesAreAddedToAdminId(
					productsToAdd,
					quantityToAddPerProduct
				);
			},
			MAX_TEST_PERIOD
		);
		it(
			'should be able to view order download invoice',
			async () => {
				const data = await createOrderData();
				await Order.createOne(data);
				await page.openUrl(`${base}/orders`);
				await page.hold(400);
				await page.clickLink('Download Invoice');
			},
			MAX_TEST_PERIOD
		);
		async function createOrderData() {
			const testQuantity = 4;
			const testProduct = products[0];
			testProduct.sellingPrice = 200;
			await testProduct.save();
			return {
				userId: user.id,
				products: [
					{
						productData: products[0],
						quantity: testQuantity,
					},
				],
				total: testQuantity * products[0].sellingPrice,
			};
		}
	});

	async function clickAddToCart() {
		await page.clickByClassName('add-to-cart-btn');
		await page.hold(400);
	}

	async function ensureUserCartIsCleared() {
		const savedUser = await User.findById(user.id);
		verifyEqual(savedUser.cart.length, 0);
	}

	async function ensureSalesAreAddedToAdminId(
		productsAdded,
		quantityAddedPerProduct
	) {
		const admin = await AdminSales.findOneByAdminId(adminId);
		const soldProducts = admin.products;
		const findResults = [];
		verifyEqual(productsAdded.length, soldProducts.length);
		for (const product of productsAdded) {
			let found = false;
			for (const soldProduct of soldProducts) {
				if (soldProduct.productData._id.toString() === product._id.toString())
					found = true;
			}
			findResults.push(found);
		}
		let allNotFound = false;
		for (const findResult of findResults) {
			if (!findResult) allNotFound = true;
		}

		verifyFalsy(allNotFound);
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
