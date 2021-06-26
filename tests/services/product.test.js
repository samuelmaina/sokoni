const { productServices } = require('../../database/services');
const { verifyEqual } = require('../utils/testsUtils');
const { calculateSellingPrice } = productServices;

describe.skip('Product services', () => {
	it('should calculate selling Price', () => {
		const product = {
			buyingPrice: 100.0,
			percentageProfit: 30,
		};
		verifyEqual(calculateSellingPrice(product), Number((130.0).toFixed(2)));
	});
});
