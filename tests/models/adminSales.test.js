const { AdminSales } = require('../../database/models');

const {
	verifyEqual,
	verifyNull,
	verifyIDsAreEqual,
} = require('../utils/testsUtils');
const { mongooseId, tokenGen } = require('../../config/constraints');

const { includeSetUpAndTearDown } = require('./utils');
const { clearDb } = require('../utils/generalUtils/database');
const { generateMongooseId } = require('../utils/generalUtils/utils');

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
});
