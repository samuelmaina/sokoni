const mongoose = require("mongoose");
const crypto = require("crypto");
const {ensureIsMongooseId, ensureStringIsLength} = require("./utils");
const Schema = mongoose.Schema;

const tokenValidityPeriodInMs = 1000 * 60 * 60;

const tokenGenerator = new Schema({
  requesterId: {
    type: Schema.Types.ObjectId,
    required: true,
    maxlength: 20,
    minlength: 10,
  },

  token: {
    type: String,
    maxlength: 64,
    minlength: 64,
  },
  expiryTime: {
    type: Date,
  },
});
const {statics, methods} = tokenGenerator;

statics.createOneForId = async function (requesterId) {
  ensureIsMongooseId(id);
  const tokenDetails = new this({
    requesterId,
    token: crypto.randomBytes(32).toString("hex"),
    expiryTime: Date.now() + tokenValidityPeriodInMs,
  });
  await tokenDetails.save();
  return tokenDetails;
};

statics.findTokenDetails = async function (token) {
  ensureStringIsLength(token, 64);
  const tokenDetails = await this.findOne({
    token,
    expiryTime: {$gt: Date.now()},
  });
  return tokenDetails;
};

methods.delete = async function () {
  await this.deleteOne();
};

module.exports = mongoose.model("Token", tokenGenerator);
