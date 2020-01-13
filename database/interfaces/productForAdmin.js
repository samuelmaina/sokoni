const Product= require('../models/product');
class ProductForAdmin{
    constructor(Model){
        this.Model=Model
    }
    createNew(productData){
        return this.Model.createNew(productData);
    }
    findById(Id){
        return this.Model.findById(Id);
    }
    findPageProductsForAdminId(adminId,page){
        return this.Model.findPageProductsForAdminId(adminId, page);
    }
    deleteById(Id){
        return this.Model.deleteById(Id)
    }
}
module.exports=new ProductForAdmin(Product)