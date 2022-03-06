const requires= require("../../utils/requires");
const { Product } = requires.Models;



const {
	createTestProducts,
	clearDb,
} = require('../../utils/generalUtils/database');
const { generateMongooseId } = require('../../utils/generalUtils/utils');
const {
	verifyEqual,
	verifyTruthy,
	ensureValueLessThan,
} = require('../../utils/testsUtils');
const { ensureObjectsHaveSameFields, productProps } = require('../utils');
const {
	ensureHasValidSellingPrice,
	ensureMetadataIsAdded,
	getSingleton,
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
					let noOfDocs = await Product.find().countDocuments();
					verifyEqual(noOfDocs, 1);
					await product.customDelete();
					noOfDocs = await Product.find().countDocuments();
					const metadata = await getSingleton();
					verifyEqual(metadata.categories.length, 1);
					verifyEqual(noOfDocs, 0);
				});
			});
		});
	});
};

async function ensureThatThePreviousCategoryIsRemoved(categoryName) {
	const metadata = await getSingleton();
	const categories = metadata.categories;

	const index = categories.findIndex(category => {
		return category.category === categoryName;
	});
	ensureValueLessThan(index, 0);
}
