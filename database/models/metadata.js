const mongoose = require('mongoose');
const { metadata } = require('../services');
const { addElementIfNonExisting } = metadata;

const { Schema, model } = mongoose;

const Metadata = new Schema({
	categories: {
		type: Array,
		required: true,
	},
	brands: {
		type: Array,
		required: true,
	},
});

const { methods, statics } = Metadata;
statics.getSingleton = async function () {
	const singleton = await this.findOne().limit(1);
	if (!singleton) return new this();
	return singleton;
};

methods.addCategory = async function (category) {
	const categories = this.categories;
	addElementIfNonExisting(categories, category);
	return await this.save();
};
methods.addBrand = async function (brand) {
	const brands = this.brands;
	addElementIfNonExisting(brands, brand);
	return await this.save();
};
module.exports = model('Metadata', Metadata);
