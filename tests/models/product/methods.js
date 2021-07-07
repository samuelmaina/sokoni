const { Product } = require('../../../database/models');
const {
	createTestProducts,
	clearDb,
} = require('../../utils/generalUtils/database');
const { generateMongooseId } = require('../../utils/generalUtils/utils');
const { verifyEqual } = require('../../utils/testsUtils');
const { ensureObjectsHaveSameFields, productProps } = require('../utils');
const {
	ensureHasValidSellingPrice,
	ensureMetadataIsAdded,
} = require('./utils');

module.exports = () => {
	describe('Methods', () => {
		let product;
		beforeEach(async () => {
			product = (await createTestProducts([generateMongooseId()], 1))[0];
		});
		afterEach(async () => {
			await clearDb();
		});
		describe('update', () => {
			it('should update correct data', async () => {
				const update = {
					title: 'test 1',
					imageUrl: 'image/to/some/path.jpg',
					buyingPrice: 1000,
					percentageProfit: 20,
					quantity: 200,
					brand: 'The good Brand',
					category: 'clothing',
					description: 'The product was very good I  loved it.',
				};
				const updated = await product.updateDetails(update);
				ensureObjectsHaveSameFields(updated, update, productProps);
				ensureHasValidSellingPrice(updated, update);
				await ensureMetadataIsAdded(update);
			});

			describe('reduceQuantity', () => {
				it('should reduce resonable quantity', async () => {
					let initial = 1000,
						decrement = 200;
					product.quantity = initial;
					await product.save();
					await product.decrementQuantity(decrement);
					verifyEqual(product.quantity, initial - decrement);
				});
			});

			describe('custom delete', () => {
				it('should delete a product ', async () => {
					await product.customDelete();
					const noOfDocs = await Product.find().countDocuments();
					verifyEqual(noOfDocs, 0);
				});
			});
		});
	});
};
