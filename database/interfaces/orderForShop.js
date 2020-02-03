const Order= require('../models/order');
class OrderForShop{
    constructor(Model){
    this.Model=Model
    }
}

/**
 * create a new order with the provided data
 */
OrderForShop.prototype.createNew=function (orderData){
    return this.Model.createNew(orderData);
}
/**
 * gets all the orders for the userId provided
 * @param { String} Id- the user Id to find orders
 */
OrderForShop.prototype.findAllForUserId= function(Id){
    return this.Model.findAllforUserId(Id);
}

/**
 *  Get order by Id and populate all  the products
 * @param {String} Id-the Id of the order to find
 
 */
OrderForShop.prototype.findByIdWithDetails=function(Id){
    return this.Model.findByIdAndPopulateProductsDetails(Id)
}
/**
 *  delete an order by Id
 * @param {String} Id- the Id of the order to delete
 *
 */
OrderForShop.prototype.deleteById= function(Id){
    return this.Model.findByIdAndRemove(Id);
}


module.exports=new OrderForShop(Order)