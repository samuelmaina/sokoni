const mongoose = require('mongoose');
const crypto = require('crypto');

const { TOKEN_VALIDITY_IN_HOURS } = require('../../config/env');

const { tokenGen, mongooseId } = require('../../config/constraints');
const { ensureIsMongooseId, ensureStringIsLength } = require('./utils');
const Schema = mongoose.Schema;

const tokenValidityPeriodInMs = 1000 * 60 * 60 * TOKEN_VALIDITY_IN_HOURS;

const tokenGenerator = new Schema({
	requesterId: {
		type: Schema.Types.ObjectId,
		required: mongooseId.error,
		maxlength: mongooseId.exact,
		minlength: mongooseId.exact,
	},

	token: {
		type: String,
		maxlength: tokenGen.token,
		minlength: tokenGen.token,
	},
	expiryTime: {
		type: Date,
	},
});
const { statics, methods } = tokenGenerator;

statics.createOneForId = async function (requesterId) {
	const tokenDetails = new this({
		requesterId,
		token: crypto.randomBytes(32).toString('hex'),
		expiryTime: Date.now() + tokenValidityPeriodInMs,
	});
	await tokenDetails.save();
	return tokenDetails;
};

statics.findTokenDetailsByToken = async function (token) {
	// ensureStringIsLength(token, 64);
	return await this.findOne({
		token,
		expiryTime: { $gt: Date.now() },
	});
};
methods.delete = async function () {
	await this.deleteOne();
};

module.exports = mongoose.model('Token', tokenGenerator);
