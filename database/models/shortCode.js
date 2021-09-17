const mongoose = require("mongoose");

const { TOKEN_VALIDITY_IN_HOURS } = require("../../config/env");

const { update } = require("../../config/constraints");

const Schema = mongoose.Schema;

const tokenValidityPeriodInMs = 1000 * 60 * 60 * TOKEN_VALIDITY_IN_HOURS;

const ShortCodeGenerator = new Schema({
  tel: {
    type: Number,
    required: "Please provide a tel of the requester.",
    maxlength: 13,
    minlength: 10,
    match: /^(?:254|\+254|0)?(7[0-9]{8})$/,
  },

  code: {
    type: Number,
    maxlength: 6,
    minlength: 6,
  },
  expiryTime: {
    type: Date,
    min: Date.now(),
  },
});
const { statics, methods } = ShortCodeGenerator;

statics.createOneForId = async function (tel) {
  const existing = await this.find({ tel });
  const noOfTokens = existing.length;

  const constrains = update.shortCode;
  let tokenDetails;
  if (noOfTokens < 1) {
    tokenDetails = new this({
      tel,
      code: Math.floor(
        constrains.min + Math.random() * (constrains.max - constrains.min)
      ),
      expiryTime: Date.now() + tokenValidityPeriodInMs,
    });
    await tokenDetails.save();
  } else if (noOfTokens > 1) {
    await this.deleteMany({ tel });
    throw new Error("Attempted a lot of verifications. Please try again");
  } else {
    tokenDetails = existing[0];
    tokenDetails.tel = tel;
    tokenDetails.code = Math.floor(
      constrains.min + Math.random() * (constrains.max - constrains.min)
    );
    tokenDetails.expiryTime = Date.now() + tokenValidityPeriodInMs;
    await tokenDetails.save();
  }
  return tokenDetails;
};

statics.findDetailByTelAndCode = async function (tel, code) {
  // ensureStringIsLength(code, 64);
  return await this.findOne({
    tel,
    code,
    expiryTime: { $gt: Date.now() },
  });
};
methods.delete = async function () {
  await this.deleteOne();
};

module.exports = mongoose.model("Short Code Generator", ShortCodeGenerator);
