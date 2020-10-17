const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;
const baseOptions = {
  discrimatorKeys: "memberToAuth",
  collection: "",
};

const Base = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tel: {
      type: Number,
      required: true,
      default: 700000000,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  baseOptions
);

const hashPassword = password => {
  return bcrypt.hash(password, 12);
};

/**
 * same as at the native create function of the model,but the password
 * is hashed before being stored.
 */
Base.statics.createNew = async function (memberData) {
  const hashedPassword = await hashPassword(memberData.password);
  const newMember = new this({
    name: memberData.name,
    email: memberData.email,
    password: hashedPassword,
  });
  return newMember.save();
};

Base.statics.findByEmail = function (email) {
  return this.findOne({email});
};
Base.statics.findOneWithCredentials = async function (email, password) {
  const member = await this.findByEmail(email);
  if (!member) {
    return null;
  }
  const isValid = await member.checkIfPasswordIsValid(password);
  if (isValid) return member;
  else return null;
};

Base.methods.resetPasswordTo = async function (password) {
  const hashedPassword = await hashPassword(password);
  this.password = hashedPassword;
  return this.save();
};

Base.methods.checkIfPasswordIsValid = async function (password) {
  const isPwdValid = await bcrypt.compare(password, this.password);
  return isPwdValid;
};
Base.methods.updateNameAndEmail = function (data) {
  //todos:check if the object has name and password property.
  this.name = data.name;
  this.email = data.email;
  return this.save();
};
Base.methods.getName = function () {
  return this.name;
};
Base.methods.getEmail = function () {
  return this.email;
};

const Member = mongoose.model("Base", Base);
module.exports = Member;
