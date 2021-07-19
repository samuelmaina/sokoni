const mongoose = require('mongoose');
const { metadata } = require('../services');
const ranges = require('../../config/constraints');
const {
	ensureStringIsLength,
	throwErrorIfStringLengthNotInRange,
	ensureIsMongooseId,
} = require('./utils');

const { addElementIfNonExisting } = metadata;

const { Schema, model } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const { category, brand } = ranges.product;

const Metadata = new Schema({
	categories: [
		{
			category: {
				type: String,
				required: category.error,
				minlength: category.minlength,
				maxlength: category.maxlength,
			},
			adminIds: [Array],
		},
	],
	brands: [
		{
			brand: {
				type: String,
				required: brand.error,
				minlength: brand.minlength,
				maxlength: brand.maxlength,
			},
			adminIds: {
				type: [ObjectId],
				required: ranges.mongooseId.error,
			},
		},
	],
});

const { methods, statics } = Metadata;
statics.getSingleton = async function () {
	const singleton = await this.findOne().limit(1);
	if (!singleton) return new this();
	return singleton;
};

methods.addCategory = async function (category) {
	const field = 'category';
	const categories = this.categories;
	ensureCategoryHasValidCategoryAndAdminId(category);
	addElementIfNonExisting(field, categories, category);
	return await this.save();
};
methods.addBrand = async function (brand) {
	const field = 'brand';
	const brands = this.brands;
	addElementIfNonExisting(field, brands, brand);
	return await this.save();
};

methods.getAllCategories = function () {
	const categories = this.categories;
	const result = [];
	for (const category of categories) {
		result.push(category.category);
	}
	return result;
};
methods.getAllCategoriesForAdminId = function (adminId) {
	const categories = this.categories;
	const result = [];
	for (const category of categories) {
		const adminIds = category.adminIds;
		if (adminIds.includes(adminId)) result.push(category.category);
	}
	return result;
};
methods.clear = async function () {
	this.brands = [];
	this.categories = [];
	return await this.save();
};

function ensureCategoryHasValidCategoryAndAdminId(categoryData) {
	const { minlength, maxlength, error } = category;
	ensureIsMongooseId(categoryData.adminId);
	throwErrorIfStringLengthNotInRange(
		categoryData.category,
		minlength,
		maxlength,
		error
	);
}
module.exports = model('Metadata', Metadata);
