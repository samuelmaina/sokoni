const Product= require('../models/product');

class ProductForShop{
    constructor(Model){
        this.Model=Model
    }
    async findProductsFor(page){
         return this.Model.getProductsWhoseQuantityIsGreaterThanZero(page);    
    }
}

ProductForShop.prototype.findById=function (Id){
    return this.Model.findById(Id)
}
module.exports = new ProductForShop(Product);

