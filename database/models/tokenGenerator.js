const mongoose = require("mongoose");
const crypto = require("crypto");

const Schema =mongoose.Schema;

const tokenValidityPeriodInMs=1000*60*60;
const tokenGenerator = new Schema({
  requesterId: {
    type: String,
    required: true
  },
  token: {
    type: String
  },
  expiryTime: {
    type: Date,
    default: Date.now() + tokenValidityPeriodInMs
  }
});


tokenGenerator.statics.createNewForId = async function(Id)  {
  const token = new this ({
    requesterId: Id
  });
  await token.generateToken();
  return token.getToken();
};

tokenGenerator.statics.findTokenDetails = async function(token) {
  const tokenDetails = await this.findOne({
    token: token,
    expiryTime: { $gt: Date.now() }
  });
  return tokenDetails
};

tokenGenerator.statics.getRequesterIdforToken= async function(token){
  const tokenDetails= await this.findOne({token:token});
  if(!tokenDetails) return null;
  return await tokenDetails.getRequesterId();
}
tokenGenerator.statics.deleteTokenById = function(tokenId){
  return this.findByIdAndDelete(tokenId);
};
tokenGenerator.methods.generateToken=  function(){
  this.token=crypto.randomBytes(32).toString('hex');
  return this.save();
}
tokenGenerator.methods.getRequesterId=function(){
  return this.requesterId;
}
tokenGenerator.methods.getToken = function() {
  return this.token;
};
tokenGenerator.methods.getTokenId=function(){
  return this._id
}


module.exports = mongoose.model("TokenGenerator", tokenGenerator);
