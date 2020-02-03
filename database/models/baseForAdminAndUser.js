const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;
const baseOptions = {
  discrimatorKeys: "memberToAuth",
  collection: ""
};

const baseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    }
  },
  baseOptions
);

const hashPassword = password => {
  return bcrypt.hash(password, 12);
};

baseSchema.statics.createNew = async function(memberData) {
  const hashedPassword= await hashPassword(memberData.password)
  const newMember = new this({
    name:memberData.name,
    email:memberData.email,
    password:hashedPassword
  });
  return newMember.save();
};

baseSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email });
};
baseSchema.statics.findOneWithCredentials = async function(email, password) {
  const admin = await this.findByEmail(email);
  if (!admin) {
    return null;
  }
  const isValid = await admin.checkIfPasswordIsValid(password);
  if (isValid) return admin;
  else return null;
};

baseSchema.methods.resetPasswordTo = async function(password){
  const hashedPassword = await hashPassword(password);
  this.password=hashedPassword;
  return this.save();
};

baseSchema.methods.checkIfPasswordIsValid = async function(password) {
  const isPwdValid = await bcrypt.compare(password, this.password);
  return isPwdValid;
};

const Admin = mongoose.model("Base", baseSchema);
module.exports = Admin;
