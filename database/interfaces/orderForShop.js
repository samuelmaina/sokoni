const Order= require('../models/order');
class OrderForShop{
    constructor(Model){
    this.Model=Model
    }
}
OrderForShop.prototype.createNew=function (orderData){
    return this.Model.createNew(orderData);
}
OrderForShop.prototype.findAllForUserId= function(Id){
    return this.Model.findAllforUserId(Id);
}

OrderForShop.prototype.findByIdWithDetails=function(Id){
    return this.Model.findByIdAndPopulateProductsDetails(Id)
}

OrderForShop.prototype.DeleteById= function(Id){
    return this.DeleteById(Id);
}


module.exports=new OrderForShop(Order)