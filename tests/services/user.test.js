const { userServices } = require('../../database/services');
const { generateMongooseId } = require('../utils/generalUtils/utils');
const {
	ensureArrayContains,
	verifyEqual,
	verifyIDsAreEqual,
} = require('../utils/testsUtils');
const { addProductIdToCart } = userServices;

describe('User services', () => {
	describe('addProductIdToCart', () => {
		it('should add productId and quantity to the cart', () => {
			const cart = [];
			const productId = generateMongooseId();
			const quantity = 20;
			addProductIdToCart(cart, productId, quantity);
			verifyEqual(cart.length, 1);
			const firstElement = cart[0];
			verifyIDsAreEqual(firstElement.productData, productId);
			verifyEqual(firstElement.quantity, quantity);
		});
		it('should only add quantity if the productId already exists in array', () => {
			const cart = [];
			const productId = generateMongooseId();
			const quantity = 20;
			addProductIdToCart(cart, productId, quantity);
			addProductIdToCart(cart, productId, quantity);
			verifyEqual(cart.length, 1);
			const firstElement = cart[0];
			verifyIDsAreEqual(firstElement.productData, productId);
			verifyEqual(firstElement.quantity, quantity * 2);
		});
	});
});
