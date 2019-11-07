const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ProductSchema = new Schema({
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
module.exports = mongoose.model("Product", ProductSchema);
