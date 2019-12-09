const mongoose = require("mongoose");
const crypto = require("crypto");
const async=require('async_hooks');

//create Tokens for both users and admins
const Schema =mongoose.Schema;
const tokenSchema=new Schema({
  email: {
    type: String,
    required: true
  },
  tokenString: {
    type: String
  },
  expiration: {
    type: Date
  }
});

tokenSchema.methods.generateTokenString=  function(){
  this.tokenString=crypto.randomBytes(32).toString('hex');
}

tokenSchema.methods.setExpiration = function(){
  this.expiration = Date.now() + 60 * 60 * 1000;
};

 tokenSchema.methods.isTokenExpired=function (){
      if (this.expiration >= Date.now()) {
       return true;
      } else {
      return false;
      } 
   }


module.exports = mongoose.model("Token", tokenSchema);
