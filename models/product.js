const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ImageUrl: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  adminId: {
    type: String,
    required: true
  },
  adminName:{
    type:String,
    required:true
  }
});
productSchema.methods.reduceQuantity=function (){
    this.quantity--;
   return this.save(); //so that we dont need to save again in the shop controller.
}
productSchema.methods.increaseQuantity= function (increaseBy){
  this.quantity+=increaseBy;
  return this.save()
}
module.exports = mongoose.model("Product", productSchema);
