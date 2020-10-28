const mongoose = require("mongoose");
const crypto = require("crypto");

const Schema = mongoose.Schema;

const tokenValidityPeriodInMs = 1000 * 60 * 60;

const tokenGenerator = new Schema({
  requesterID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
  },
  expiryTime: {
    type: Date,
  },
});

tokenGenerator.statics.createOneForID = async function (requesterID) {
  const tokenDetails = new this({
    requesterID,
    token: crypto.randomBytes(32).toString("hex"),
    expiryTime: Date.now() + tokenValidityPeriodInMs,
  });
  await tokenDetails.save();
  return tokenDetails;
};

tokenGenerator.statics.findTokenDetails = async function (token) {
  const tokenDetails = await this.findOne({
    token,
    expiryTime: {$gt: Date.now()},
  });
  return tokenDetails;
};

tokenGenerator.statics.findRequesterIDForToken = async function (token) {
  const tokenDetails = await this.findOne({token});
  if (!tokenDetails) return null;
  return tokenDetails.requesterID;
};
tokenGenerator.statics.delete = async function () {
  await this.deleteOne();
};

module.exports = mongoose.model("Token", tokenGenerator);
