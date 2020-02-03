const AdminSales=require('../models/adminSale');

class AdminSalesForShop{
    
    constructor(Model){
        this.Model=Model
    }
    /**
   *create a new Sales for an Admin
   * @param {String} adminId - adminId to create new sales
   * @returns return the created adminSales
   */
   createNew(adminId){return this.Model.createNew(adminId)}
    findSalesForAdminId(adminId){
        return this.Model.findOneForAdminId(adminId);
    }

}
module.exports=new AdminSalesForShop(AdminSales);