const { PRODUCTS_PER_PAGE } = require('../../config/env');
const { convertTo2Dps } = require('../utils');

exports.calculateSellingPrice = productData => {
	const { percentageProfit, buyingPrice } = productData;
	productData.sellingPrice = convertTo2Dps(
		(1 + percentageProfit / 100.0) * buyingPrice
	);
};

exports.calculatePaginationData = (page, noOfProducts) => {
	return {
		hasPreviousPage: page > 1,
		hasNextPage: page * PRODUCTS_PER_PAGE < noOfProducts,
		nextPage: page + 1,
		previousPage: page - 1,
		lastPage: Math.ceil(noOfProducts / PRODUCTS_PER_PAGE),
		currentPage: page,
	};
};
exports.findCategoriesPresent = products => {
	let categories = [];
	for (const product of products) {
		let prodCategory = product.category;
		const categoryIndex = categories.findIndex(c => {
			return c === prodCategory;
		});
		if (categoryIndex < 0) {
			categories.push(prodCategory);
		}
	}
	return categories;
};
