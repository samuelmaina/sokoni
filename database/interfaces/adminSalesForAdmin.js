const AdminSales=require('../models/adminSale');
class AdminSalesForAdmin {
  constructor(Model) {
    this.Model = Model;
  }
  async getSalesForAdminIdWithinAnInterval(adminId,fromTime,ToTime){
     return this.Model.getSalesForAdminIdWithinAnInterval(adminId,fromTime,ToTime)
  }
}
module.exports=new AdminSalesForAdmin(AdminSales)