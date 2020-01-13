const mongoose=require('mongoose')
const Base=require('./baseForAdminAndUser');
const Admin = Base.discriminator('Admin',new mongoose.Schema({}));
module.exports=Admin