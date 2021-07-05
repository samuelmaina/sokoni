const { Order } = require('../../database/models');
const {
	clearDb,
	createUserWithData,
	createTestProducts,
} = require('../utils/generalUtils/database');
const {
	generateMongooseId,
	generateStringSizeN,
} = require('../utils/generalUtils/utils');
const {
	verifyEqual,
	verifyIDsAreEqual,
	verifyFalsy,
	verifyRejectsWithError,
} = require('../utils/testsUtils');
const { includeSetUpAndTearDown, ValidationError, ranges } = require('./utils');

const userCredentials = {
	name: 'John Doe',
	email: 'johndoe@gmail.com',
	password: 'Password55?',
};

describe('Order', () => {
	let adminId, products, user;
	includeSetUpAndTearDown();
	beforeEach(async () => {
		adminId = generateMongooseId();
		products = await createTestProducts([adminId], 2);
		user = await createUserWithData(userCredentials);
	});
	afterEach(async () => {
		await clearDb();
	});
	describe('CreateOne', () => {
		const { mongooseId, order } = ranges;
		const { exact } = mongooseId;
		const { min, max, error } = order.quantity;

		it('should create for correct Data', async () => {
			const order = {
				products: [
					{
						id: products[0].id,
						quantity: min,
					},
					{
						id: products[1].id,
						quantity: max,
					},
				],
				userId: user.id,
			};
			const created = await Order.createOne(order);
			ensureOderHasTheRightData(created, order);
		});
		it('should refuse when user Id is not valid', async () => {
			const order = {
				products: [
					{
						id: products[0].id,
						quantity: min,
					},
					{
						id: products[1].id,
						quantity: max,
					},
				],
				userId: generateStringSizeN(exact),
			};

			verifyRejectsWithError(async () => {
				await Order.createOne(order);
			}, ValidationError);
		});
		it('should refuse when product id is incorrect', async () => {
			const order = {
				products: [
					{
						id: generateStringSizeN(exact),
						quantity: min,
					},
					{
						id: products[1].id,
						quantity: max,
					},
				],
				userId: user.id,
			};

			verifyRejectsWithError(async () => {
				await Order.createOne(order);
			}, ValidationError);
		});
		describe('reject when quantity is out of bound', () => {
			it('less than the bound', async () => {
				const order = {
					products: [
						{
							id: products[0].id,
							quantity: min - 1,
						},
						{
							id: products[1].id,
							quantity: max,
						},
					],
					userId: user.id,
				};

				verifyRejectsWithError(async () => {
					await Order.createOne(order);
				}, error);
			});
			it('greater than the bound', async () => {
				const order = {
					products: [
						{
							id: products[0].id,
							quantity: min,
						},
						{
							id: products[1].id,
							quantity: max + 1,
						},
					],
					userId: user.id,
				};

				verifyRejectsWithError(async () => {
					await Order.createOne(order);
				}, error);
			});
		});
	});
});

function ensureOderHasTheRightData(created, dataUserForCreation) {
	verifyIDsAreEqual(created.userId, dataUserForCreation.userId);
	const createdProducts = created.products;
	const expectedProducts = dataUserForCreation.products;
	verifyEqual(createdProducts.length, expectedProducts.length);
	const findResults = [];
	for (const product of expectedProducts) {
		let found = false;
		for (const prod of createdProducts) {
			if (prod.productData._id.toString() === product.id.toString()) {
				found = true;
				verifyEqual(prod.quantity, product.quantity);
			}
		}
		findResults.push(found);
	}
	let allNotFound = false;
	for (const findResult of findResults) {
		if (!findResult) allNotFound = true;
	}
	verifyFalsy(allNotFound);
}
