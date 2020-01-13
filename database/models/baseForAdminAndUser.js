const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;
const baseOptions = {
  discrimatorKeys: "memberToAuth",
  collection: "member"
};

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  baseOptions
);



adminSchema.statics.createNew = async function (adminData) {
  const hashedPassword = await bcrypt.hash(adminData.password, 12);
  const newAdmin = new this ({
    name: adminData.name,
    email: adminData.email,
    password: hashedPassword
  });
  return newAdmin.save();
};
adminSchema.statics.findByEmail =function (email){
  return  this.findOne({ email: email });
};
adminSchema.statics.findOneWithCredentials= async function(email,password){
   const admin= await this.findByEmail(email);
   if(!admin){
    return null
   }
   const isValid= await admin.checkIfPasswordIsValid(password);
   if (isValid) return admin 
   else return null;
 }

adminSchema.methods.resetPasswordTo = async function(password){
  const hashedPassword = await bcrypt.hash(password,12);
  this.password = hashedPassword;
  return this.save();
};


adminSchema.methods.checkIfPasswordIsValid = async function(password){
  const isPwdValid = await bcrypt.compare(password, this.password);
  return isPwdValid
};


const Admin = mongoose.model("Base", adminSchema);
module.exports=Admin


