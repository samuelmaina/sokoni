const { startApp, getNewDriverInstance, closeApp } = require('./config');

const { Page } = require('./utils');
const {
	createTestProducts,
	clearDb,
	feedProductsWithTestCategories,
} = require('../utils/generalUtils/database');
const { generateMongooseId } = require('../utils/generalUtils/utils');

const adminId = generateMongooseId();

let page;

const TRIALS = 10;

const MAX_TEST_PERIOD = 30000;

const PORT = 5934;
const base = `http://localhost:${PORT}`;
const homePage = `${base}/`;

describe('The HomePage(Shop) can be navigated', () => {
	let products = [];
	beforeAll(async () => {
		await startApp(PORT);
		page = new Page(getNewDriverInstance());
		products = await createTestProducts([adminId], TRIALS);
	}, MAX_TEST_PERIOD);

	afterAll(async () => {
		await page.close();
		await clearDb();
		await closeApp();
	});
	beforeEach(async () => {
		await page.openUrl(homePage);
	}, MAX_TEST_PERIOD);

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

	//Tests for checking that products are rendered are left out.
	//When this test suite  is run, the developer will see if the product data is rendered or not.
	it(
		'should click the Add to Cart button',
		async () => {
			await page.clickByClassName('add-to-cart-btn');
			const title = await page.getTitle();

			//user can not add to cart when they are not logged in.
			//This is the entry point and user is not logged in,so
			// we expect a redirect to "User Log In"
			expect(title).toEqual('User Log In');
		},
		MAX_TEST_PERIOD
	);
	it(
		'should click a pagination link ',
		async () => {
			await page.clickLink('1');
			//the passing of this test is that it should not throw.
		},
		MAX_TEST_PERIOD
	);
});
