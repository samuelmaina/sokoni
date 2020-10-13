const mongoose = require("mongoose");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const tokenValidityPeriodInMs = 1000 * 60 * 60;
const tokenGenerator = new Schema({
  requesterId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    default: crypto.randomBytes(32).toString("hex"),
  },
  expiryTime: {
    type: Date,
    default: Date.now() + tokenValidityPeriodInMs,
  },
});

tokenGenerator.statics.createNewForId = async function (Id) {
  const token = new this({
    requesterId: Id,
  });
  await token.save();
  return token;
};

tokenGenerator.statics.findTokenDetails = async function (token) {
  const tokenDetails = await this.findOne({
    token,
    expiryTime: {$gt: Date.now()},
  });
  return tokenDetails;
};

tokenGenerator.statics.getRequesterIdforToken = async function (token) {
  const tokenDetails = await this.findOne({token});
  if (!tokenDetails) return null;
  return await tokenDetails.getRequesterId();
};
tokenGenerator.statics.deleteTokenById = function (tokenId) {
  return this.findByIdAndDelete(tokenId);
};
tokenGenerator.methods.getRequesterId = function () {
  return this.requesterId;
};
tokenGenerator.methods.getToken = function () {
  return this.token;
};
tokenGenerator.methods.getTokenId = function () {
  return this._id;
};

module.exports = mongoose.model("Token", tokenGenerator);
