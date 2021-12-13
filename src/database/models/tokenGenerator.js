const mongoose = require("mongoose");
const crypto = require("crypto");

const { TOKEN_VALIDITY_IN_HOURS } = require("../../config/env");

const { token } = require("../../config/constraints");
const { ensureIsMongooseId, ensureStringIsLength } = require("./utils");
const Schema = mongoose.Schema;

const tokenValidityPeriodInMs = 1000 * 60 * 60 * TOKEN_VALIDITY_IN_HOURS;

const tokenGenerator = new Schema({
  requester: {
    type: String,
    required: token.requester.error,
    minlength: token.requester.minlength,
    maxlength: token.requester.maxlength,
  },

  token: {
    type: String,
    maxlength: [token.howLong.exact, token.howLong.error],
    minlength: [token.howLong.exact, token.howLong.error],
  },
  expiryTime: {
    type: Date,
    min: Date.now(),
  },
});
const { statics, methods } = tokenGenerator;

statics.createOneForId = async function (requester) {
  const existingRequesters = await this.find({ requester });
  if (existingRequesters.length > 0) {
    return existingRequesters[0];
  }
  const tokenDetails = new this({
    requester,
    token: crypto.randomBytes(32).toString("hex"),
    expiryTime: Date.now() + tokenValidityPeriodInMs,
  });
  await tokenDetails.save();
  return tokenDetails;
};

statics.findTokenDetailsByToken = async function (requesterId, token) {
  return await this.findOne({
    requesterId,
    token,
    expiryTime: { $gt: Date.now() },
  });
};
methods.delete = async function () {
  await this.deleteOne();
};

module.exports = mongoose.model("Token", tokenGenerator);
