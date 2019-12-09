const mongoose = require("mongoose");
const Product=require('../models/product');
const Schema = mongoose.Schema;


const AdminSchema = new Schema({
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  soldProducts:{
    type:Array,
  }
});
AdminSchema.methods.addSoldProduct=function(productId){
  this.soldProducts.push(productId);
  return this.save();
}
AdminSchema.methods.getSoldProducts=function(){
 return this.soldProducts;
}
module.exports=mongoose.model('Admin',AdminSchema)
