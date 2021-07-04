const { AdminSales } = require('../../database/models');

const {
	verifyEqual,

	verifyIDsAreEqual,
	ensureCloselyEqual,
	verifyTruthy,
} = require('../utils/testsUtils');

const {
	includeSetUpAndTearDown,
	ensureObjectsHaveSameFields,
} = require('./utils');
const {
	clearDb,
	createTestProducts,
	createAdminSalesTestDataForAdminId,
} = require('../utils/generalUtils/database');
const { generateMongooseId } = require('../utils/generalUtils/utils');
const { ensureProductsHaveProperties } = require('./user/util');

describe('Admin Sales', () => {
	includeSetUpAndTearDown();
	afterEach(async () => {
		await clearDb();
	});

	it('createOne', async () => {
		const adminId = generateMongooseId();
		const adminSales = await AdminSales.createOne(adminId);
		verifyIDsAreEqual(adminId, adminSales.adminId);
	});
	it('findOneForAdminIdAndPopulateProductsData', async () => {
		const adminId = generateMongooseId();
		const numberOfProds = 10;

		const created = await createTestProducts([adminId], numberOfProds);
		await createAdminSalesTestDataForAdminId(adminId, created);

		const sales = await AdminSales.findOneForAdminIdAndPopulateProductsData(
			adminId
		);
		const props = ['title', 'sellingPrice', 'buyingPrice', 'imageUrl'];
		ensureProductsHaveProperties(sales, props);
		sales.forEach((product, index) => {
			const { total, productData, profit } = product;
			verifyEqual(total, Number((100 * productData.sellingPrice).toFixed(2)));
			ensureCloselyEqual(
				profit,
				Number((total - productData.buyingPrice * 100).toFixed(2))
			);

			//ensure that arranged according to their profits in descending order.
			if (hasNextElement()) {
				verifyTruthy(product.profit <= sales[index + 1].profit);
			}
			function hasNextElement() {
				return index < sales.size - 1;
			}
		});
	});
});
