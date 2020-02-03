const Product= require('../models/product');

class ProductForShop{
    constructor(Model){
        this.Model=Model
    }

    /**
     * Finds all the products for a certain page
     * @param {Number} page The page that we want to get productS for
     * @returns an object with the pagination data for the page and also the products
     */
    async findProductsForPage(page){
         return this.Model.getProductsWhoseQuantityIsGreaterThanZero(page);    
    }
    
}

/**
 * finds  a product with the provided Id
 * @param {String} Id-.The product Id 
 */
ProductForShop.prototype.findById=function (Id){
    return this.Model.findById(Id)
}
module.exports = new ProductForShop(Product);

