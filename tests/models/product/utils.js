const { PRODUCTS_PER_PAGE } = require('../../../config/env');
const { Product, Metadata } = require('../../../database/models');
const {
	generatePerfectProductData,
} = require('../../utils/generalUtils/utils');
const {
	verifyEqual,
	verifyTruthy,
	verifyIDsAreEqual,
	ensureObjectHasKeyValuePair,
} = require('../../utils/testsUtils');

exports.createProductsWithAdminIdAndCategory = async (
	num,
	adminId,
	category
) => {
	let product;
	const products = [];
	for (let i = 0; i < num; i++) {
		product = generatePerfectProductData();
		product.adminId = adminId;
		product.category = category;
		product = await Product.createOne(product);
		products.push(product);
	}
	return products;
};

exports.modifyProductsCategories = async (products, categories) => {
	const noOfCategories = categories.length;
	const noOfProducts = products.length;

	let product;
	for (let i = 0; i < noOfProducts; i++) {
		product = products[i];

		product.category = categories[i % noOfCategories];
		await product.save();
	}
};

exports.validateDisplayData = (data, page) => {
	const { products, paginationData } = data;
	verifyEqual(products.length, PRODUCTS_PER_PAGE);
	ensureEachProductHasPositiveQuantity(products);
	ensureObjectHasKeyValuePair(paginationData, 'currentPage', page);
};

function ensureEachProductHasPositiveQuantity(prods) {
	prods.forEach(prod => {
		expect(prod.quantity).toBeGreaterThan(0);
	});
}

exports.ensureMetadataIsAdded = async dataUsedDuringCreation => {
	const metadata = await Metadata.getSingleton();
	const { brands, categories } = metadata;
	let brandExists = false;
	for (const brand of brands) {
		if (brand.brand === dataUsedDuringCreation.brand) brandExists = true;
	}

	verifyTruthy(brandExists);
	let categoryExists = false;
	for (const category of categories) {
		if (category.category === dataUsedDuringCreation.category)
			categoryExists = true;
	}
	verifyTruthy(categoryExists);
};

exports.ensureHasValidSellingPrice = (created, dataUsedDuringCreation) => {
	const { percentageProfit, buyingPrice } = dataUsedDuringCreation;
	expect(created.sellingPrice).toBe(
		Number((buyingPrice * (1 + percentageProfit / 100)).toFixed(2))
	);
};

exports.ensureProductsHaveAdminId = (products, adminId) => {
	for (const product of products) {
		verifyIDsAreEqual(adminId, product.adminId);
	}
};
