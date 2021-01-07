const mongoose = require("mongoose");

const {BaseServices} = require("../services");
const {
  hashPassword,
  confirmPassword,
  errorMessages,
  ranges,
  rejectIfFieldErroneous,
  ensureDataHasValidFields,
} = BaseServices;

const Schema = mongoose.Schema;
const baseOptions = {
  discrimatorKeys: "memberToAuth",
  collection: "",
};

const Base = new Schema(
  {
    name: {
      type: String,
      required: errorMessages.name,
      trim: true,
      minlength: ranges.name[0],
      maxlength: ranges.name[1],
    },
    email: {
      type: String,
      required: errorMessages.email,
      trim: true,
      lowercase: true,
      minlength: ranges.email[0],
      maxlength: ranges.email[1],
    },
    tel: {
      type: String,
      required: errorMessages.tel,
      minlength: ranges.tel,
      maxlength: ranges.tel,
      default: "+254700000000",
    },
    password: {
      type: String,
      required: true,
      trim: true,
      //password will be hashed
      //.It will take more space.
      maxlength: 80,
      minlength: 10,
    },
  },
  baseOptions
);

const {statics, methods} = Base;

statics.createOne = async function (data) {
  const fieldsThatMustBePresent = ["name", "email", "password"];
  ensureDataHasValidFields(data, fieldsThatMustBePresent);
  const hashedPassword = await hashPassword(data.password);
  const newMember = new this({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
  return await newMember.save();
};

statics.findByEmail = async function (email) {
  rejectIfFieldErroneous("email", email);
  return await this.findOne({email});
};
statics.findOneWithCredentials = async function (email, password) {
  const member = await this.findByEmail(email);
  if (!member) {
    return null;
  }
  const isValid = await member.isPasswordCorrect(password);
  if (isValid) return member;
  else return null;
};

methods.isPasswordCorrect = async function (password) {
  rejectIfFieldErroneous("password", password);
  const isPwdValid = await confirmPassword(password, this.password);
  return isPwdValid;
};

methods.update = async function (field, data) {
  rejectIfFieldErroneous(field, data);
  if (field === "password") {
    data = await hashPassword(data);
  }
  this.set(field, data);
  await this.save();
};
methods.updateManyFields = async function (data) {
  const fieldsToValidate = Object.getOwnPropertyNames(data);
  ensureDataHasValidFields(data, fieldsToValidate);
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      await this.update(key, data[key]);
    }
  }
};

methods.deleteAccount = async function () {
  await this.deleteOne();
};

const Member = mongoose.model("Base", Base);
module.exports = Member;
