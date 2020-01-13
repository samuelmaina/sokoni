const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PRODUCTS_PER_PAGE = 3;
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

productSchema.statics.createNew = function(productData) {
  const product = new this({
    title: productData.title,
    ImageUrl: productData.imagePath,
    price: productData.price,
    description: productData.description,
    quantity: productData.quantity,
    adminId: productData.adminId,
    adminName: productData.adminName
  });
  return product.save();
};

productSchema.statics.getTotalNumberOfProducts= function(){
 return this.find().countDocuments();
}


productSchema.statics.getProductsWhoseQuantityIsGreaterThanZero= async function(page=1){
  const total= await this.getTotalNumberOfProducts();
    const paginationData = {
      hasNextPage: page * PRODUCTS_PER_PAGE < total,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
      currentPage: page
    };

  const products= await this.find({ quantity: { $gt: 0 } })
  .skip((page-1)*PRODUCTS_PER_PAGE).limit(PRODUCTS_PER_PAGE);
  return {
    paginationData,
    total,products
  }
}

productSchema.statics.findPageProductsForAdminId= async function(adminId,page){
  const total = await  this.getTotalAdminProducts(adminId);
    const paginationData = {
      hasNextPage: page * PRODUCTS_PER_PAGE < total,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(total / PRODUCTS_PER_PAGE),
      currentPage: page
    };
   const products= await this.find({adminId:adminId})
  .skip((page-1)*PRODUCTS_PER_PAGE).limit(PRODUCTS_PER_PAGE);
  return{
    paginationData,
    products
  }
}
productSchema.statics.getTotalAdminProducts= function(adminId){
  return this.find({adminId:adminId}).countDocuments()
}

productSchema.statics.deleteById= function(prodId){
  return this.findByIdAndDelete(prodId);
}



productSchema.methods.isCreatedByAdminId= function(adminId){
  return this.adminId.toString()===adminId.toString()
}
productSchema.methods.reduceQuantity=function (){
    this.quantity--;
   return this.save(); //so that we dont need to save again in the shop controller.
}
productSchema.methods.increaseQuantity= function (increaseBy){
  this.quantity+=increaseBy;
  return this.save()
}
module.exports = mongoose.model("Product", productSchema);
