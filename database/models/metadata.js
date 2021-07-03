const mongoose = require('mongoose');
const { metadata } = require('../services');
const { addElementIfNonExisting } = metadata;

const { Schema, model } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const Metadata = new Schema({
	categories: [
		{
			category: {
				type: String,
				required: true,
			},
			adminIds: [ObjectId],
		},
	],
	brands: [
		{
			brand: {
				type: String,
				required: true,
			},
			adminIds: [ObjectId],
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
module.exports = model('Metadata', Metadata);
