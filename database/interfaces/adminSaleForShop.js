const AdminSales=require('../models/adminSale');

class AdminSalesForShop{
    constructor(Model){
        this.Model=Model
    }
    createNew(adminId){return this.Model.createNew(adminId)}
    findSalesFor(adminId){
        return this.Model.findOneForId(Id)
    }

}
module.exports=new AdminSalesForShop(AdminSales)