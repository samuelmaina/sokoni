const mongoose = require('mongoose');

const { product, mongooseId } = require('../../config/constraints');
const ranges = product;
const { productServices, metadata } = require('../services');
const {
	findCategoriesPresent,
	calculateSellingPrice,
	calculatePaginationData,
} = productServices;
const {
	ensureStringIsNonEmpty,
	ensureIsMongooseId,
	ensureIsPositiveInt,
	ensureIsNonEmptyObject,
	ensureValueIsWithinRange,
	ensureIsInt,
} = require('./utils');

const { PRODUCTS_PER_PAGE } = require('../../config/env');
const { fileManipulators } = require('../../utils');
const { Metadata } = require('.');

const POSITIVE_QUNTITY_QUERY = { quantity: { $gt: 0 } };

const Schema = mongoose.Schema;

const Product = new Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: ranges.title.minlength,
			maxlength: ranges.title.maxlength,
		},
		imageUrl: {
			type: String,
			required: true,
			trim: true,
			minlength: ranges.imageUrl.minlength,
			maxlength: ranges.imageUrl.maxlength,
		},
		buyingPrice: {
			type: Number,
			required: true,
			min: ranges.buyingPrice.min,
			max: ranges.buyingPrice.max,
		},
		percentageProfit: {
			type: Number,
			required: true,
			min: ranges.percentageProfit.min,
			max: ranges.percentageProfit.max,
		},
		//this one is always calculated by
		//the server so no need
		//to specify it in the schema.
		sellingPrice: {
			type: Number,
		},

		description: {
			type: String,
			required: true,
			trim: true,
			minlength: ranges.description.minlength,
			maxlength: ranges.description.maxlength,
		},
		quantity: {
			type: Number,
			required: true,
			min: ranges.quantity.min,
			max: ranges.quantity.max,
		},
		adminId: {
			type: Schema.Types.ObjectId,
			ref: 'Admin',
			required: true,
			minlength: mongooseId,
			maxlength: mongooseId,
		},
		category: {
			type: String,
			minlength: ranges.category.minlength,
			maxlength: ranges.category.maxlength,
			required: true,
		},
		brand: {
			type: String,
			minlength: ranges.brand.minlength,
			maxlength: ranges.brand.maxlength,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
const { statics, methods } = Product;

statics.createOne = async function (productData) {
	calculateSellingPrice(productData);
	const metadata = await getMetadata();
	const { category, brand, adminId } = productData;
	const Product = mongoose.model('Product');
	const product = Product(productData);
	await product.save();
	await metadata.addCategory({
		category,
		adminId,
	});
	await metadata.addBrand({
		brand,
		adminId,
	});
	return product;
};

statics.findPageProductsForAdminId = async function (adminId, page) {
	const query = { adminId };
	const products = await this.getProductsPerPageForQuery(page, query);
	const paginationData = await this.calculatePaginationData(page, query);
	if (products.length < 1) return null;
	return {
		paginationData,
		products,
	};
};

statics.findProductsForPage = async function (page = 1) {
	const products = await this.getProductsPerPage(page);
	const paginationData = await this.calculatePaginationData(page);
	if (products.length === 0) return null;
	return {
		paginationData,
		products,
	};
};

statics.findCategories = async function () {
	const metadata = await getMetadata();
	return metadata.getAllCategories();
};
statics.findCategoriesForAdminId = async function (adminId) {
	const metadata = await getMetadata();
	return metadata.getAllCategoriesForAdminId(adminId.toString());
};

statics.findCategoryProductsForAdminIdAndPage = async function (
	adminId,
	category,
	page
) {
	const query = { adminId, category };
	const paginationData = await this.calculatePaginationData(page, query);
	const products = await this.getProductsPerPageForQuery(page, query);
	return {
		paginationData,
		products,
	};
};

statics.findCategoryProductsForPage = async function (category, page) {
	const categoryQuery = { category };
	const products = await this.getProductsPerPageForQuery(page, categoryQuery);
	const paginationData = await this.calculatePaginationData(
		page,
		categoryQuery
	);
	if (products.length === 0) return null;
	return {
		products,
		paginationData,
	};
};

methods.isCreatedByAdminId = function (adminId) {
	return this.adminId.toString() === adminId.toString();
};
methods.incrementQuantity = async function (quantity) {
	this.quantity += quantity;
	return await this.save();
};
methods.decrementQuantity = async function (quantity) {
	const howMany = Number(quantity);
	let currentQuantity = this.quantity;
	if (currentQuantity < howMany)
		throw new Error('Can decrement such decrement.');
	currentQuantity -= howMany;
	this.quantity = currentQuantity;
	return await this.save();
};

methods.updateDetails = async function (productData) {
	if (this.imageUrl !== productData.imageUrl) {
		fileManipulators.deleteFile(this.imageUrl);
	}
	calculateSellingPrice(productData);
	for (const property in productData) {
		this[property] = productData[property];
	}
	const metadata = await getMetadata();
	const { brand, category } = productData;
	const adminId = this.adminId;
	await metadata.addCategory({
		category,
		adminId,
	});
	await metadata.addBrand({
		brand,
		adminId,
	});
	return await this.save();
};
methods.customDelete = async function () {
	await fileManipulators.deleteFile(this.imageUrl);
	await this.deleteOne();
};

//static helpers.
statics.getProductsPerPage = async function (page) {
	return await this.getProductsPerPageForQuery(page, POSITIVE_QUNTITY_QUERY);
};

statics.NoOfProductsMeetingQuery = async function (query) {
	//the products fetched must have a positive quantity.So merge
	// POSITIVE_QUNTITY_QUERY with the query.
	for (const property in POSITIVE_QUNTITY_QUERY) {
		query[property] = POSITIVE_QUNTITY_QUERY[property];
	}
	return await this.find(query).countDocuments();
};

statics.calculatePaginationData = async function (page, query = {}) {
	const total = await this.NoOfProductsMeetingQuery(query);
	return calculatePaginationData(page, total);
};

statics.getProductsPerPageForQuery = async function (page, query) {
	return await this.find(query)
		.skip((page - 1) * PRODUCTS_PER_PAGE)
		.limit(PRODUCTS_PER_PAGE);
};

async function getMetadata() {
	const Metadata = mongoose.model('Metadata');
	return await Metadata.getSingleton();
}

module.exports = mongoose.model('Product', Product);
