const mongoose = require("mongoose");
const crypto = require("crypto");

const { TOKEN_VALIDITY_IN_HOURS } = require("../../config/env");

const { tokenGen, mongooseId } = require("../../config/constraints");
const { ensureIsMongooseId, ensureStringIsLength } = require("./utils");
const Schema = mongoose.Schema;

const tokenValidityPeriodInMs = 1000 * 60 * 60 * TOKEN_VALIDITY_IN_HOURS;

const EmailToken = new Schema({
  email: {
    type: String,
    required: "please provide a valid email",
    minlength: 2,
    maxlength: 200,
  },

  token: {
    type: String,
    maxlength: 64,
    minlength: 64,
  },
  expiryTime: {
    type: Date,
    min: Date.now(),
  },
});
const { statics, methods } = EmailToken;

statics.createOneForEmail = async function (email) {
  const tokenDetails = new this({
    email,
    token: crypto.randomBytes(32).toString("hex"),
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

module.exports = mongoose.model("Email Token", EmailToken);
