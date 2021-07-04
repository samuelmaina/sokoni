const { User } = require('../../database/models');
const {
	clearDb,
	createUserWithData,
} = require('../utils/generalUtils/database');
const baseTest = require('./baseAdminAndUser');
const { generateMongooseId } = require('../utils/generalUtils/utils');
const { verifyEqual, ensureArrayContains } = require('../utils/testsUtils');
const { includeSetUpAndTearDown } = require('./utils');
const credentials = {
	name: 'John Doe',
	email: 'johndoe@email.com',
	password: 'PassWord55?',
};

describe('User test', () => {
	includeSetUpAndTearDown();
	baseTest(User);
	describe('user methods', () => {
		let user;
		beforeEach(async () => {
			user = await User.createOne(credentials);
		});
		afterEach(async () => {
			await clearDb();
		});
		describe('user methods', () => {
			it('should ', async () => {
				const productId = generateMongooseId();
				const quantity = 50;
				await user.addProductsToCart(productId, quantity);
				const cart = user.cart;
				verifyEqual(cart.length, 1);
				ensureArrayContains(cart, { prodcutData: productId, quantity });
			});
		});
	});
});
