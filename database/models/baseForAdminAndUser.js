const mongoose = require("mongoose");

const {BaseServices} = require("../services");
const {hashPassword, confirmPassword} = BaseServices;

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
      type: String,
      required: true,
      default: "0700000000",
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  baseOptions
);

/**
 * same as at the native create function of the model,but the password
 * is hashed before being stored.
 */
Base.statics.createOne = async function (memberData) {
  const hashedPassword = await hashPassword(memberData.password);
  const newMember = new this({
    name: memberData.name,
    email: memberData.email,
    password: hashedPassword,
  });
  return await newMember.save();
};

Base.statics.findByEmail = function (email) {
  return this.findOne({email});
};
Base.statics.findOneWithCredentials = async function (email, password) {
  const member = await this.findByEmail(email);
  if (!member) {
    return null;
  }
  const isValid = await member.isPasswordCorrect(password);
  if (isValid) return member;
  else return null;
};

Base.methods.isPasswordCorrect = async function (password) {
  const isPwdValid = await confirmPassword(password, this.password);
  return isPwdValid;
};
Base.methods.update = async function (field, data) {
  //for password we need to hash it
  //before it is stored in the database.
  if (field === "password") {
    this[field] = await hashPassword(data);
    return await this.save();
  }
  this[field] = data;
  await this.save();
};

Base.methods.deleteAccount = async function () {
  await this.deleteOne();
};

const Member = mongoose.model("Base", Base);
module.exports = Member;
