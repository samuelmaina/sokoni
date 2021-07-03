const mongoose = require('mongoose');

const ranges = require('../../config/constraints');

const { adminSalesServices } = require('../services');

const Schema = mongoose.Schema;

const AdminSales = new Schema({
	adminId: {
		type: Schema.Types.ObjectId,
		ref: 'Admin',
		required: true,
		maxlength: ranges.mongooseId,
		minlength: ranges.mongooseId,
	},
	products: [
		{
			productData: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: true,
				maxlength: ranges.mongooseId,
				minlength: ranges.mongooseId,
			},
			sales: [
				{
					quantity: {
						type: Number,
						required: true,
						max: ranges.adminSales.quantity.max,
						min: ranges.adminSales.quantity.min,
					},
					soldAt: { type: Date, require: true },
				},
			],
		},
	],
});
const { statics, methods } = AdminSales;

statics.createOne = async function (adminId) {
	const adminSale = new this({
		adminId,
	});
	return await adminSale.save();
};

statics.findOneForAdminIdAndPopulateProductsData = async function (adminId) {
	const sales = await this.findOne({ adminId }).populate(
		'products.productData',
		'title sellingPrice buyingPrice imageUrl'
	);
	if (sales) {
		const soldOut = adminSalesServices.calculatProductsSalesData(
			sales.products
		);
		return soldOut;
	}
	return [];
};

statics.findByAdminIdAndDelete = async function (adminID) {
	await this.findOneAndDelete({ adminID });
};

statics.findSalesForAdminIDWithinAnInterval = async function (
	adminID,
	fromTime,
	toTIme
) {
	const adminSales = await this.findOneForAdminIdAndPopulateProductsData(
		adminID
	);
	if (!adminSales) return [];
	const productsToDisplay = adminSales.findSalesWithinAnInterval(
		fromTime,
		toTIme
	);
	return adminSalesServices.calculatProductsSalesData(productsToDisplay);
};

methods.addSale = async function (saleDetails) {
	const soldProducts = this.products;
	this.products = adminSalesServices.addSale(soldProducts, saleDetails);
	return this.save();
};

methods.clearProducts = async function () {
	this.products = [];
	return await this.save();
};

module.exports = mongoose.model('AdminSale', AdminSales);
