const mongoose = require("mongoose");

const ranges = require("../../config/constraints").base;

const {
  throwErrorIfStringLengthNotInRange,
  ensureStringIsLength,
} = require("./utils");
const { baseServices } = require("../services");
const { hashPassword, confirmPassword } = baseServices;

const Schema = mongoose.Schema;

const baseOptions = {
  discrimatorKeys: "_member",
  collection: "auth",
};

const Base = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 100,
      required: "Name must be 1 to 100 characters long.",
    },
    email: {
      type: String,
      required: "Email must be 1 to 100 characters long and well formatted",
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 100,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    isEmailConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    tel: {
      type: String,
      required: "Tell must be 10 or 13 characters long",
      minlength: 10,
      maxlength: 13,
      default: "+254700000000",
      //the regular expression is failing, will construct my own.
      // match: [
      //   "^(?:254|+254|0)?((?:(?:7(?:(?:3[0-9])|(?:5[0-6])|(8[5-9])))|(?:1(?:[0][0-2])))[0-9]{6})$",
      //   "Please fill a valid tel number",
      // ],
    },
    password: {
      type: String,
      required: true,
      //password will be hashed
      //.It will take more space.
      maxlength: 80,
      minlength: 8,
    },
  },
  baseOptions
);

const { statics, methods } = Base;

statics.createOne = async function (data) {
  const { name, email, password } = data;

  const { minlength, maxlength, error } = ranges.password;

  throwErrorIfStringLengthNotInRange(password, minlength, maxlength, error);
  //first let the document first go through validation test
  // and then store the hashed password. The validation of name and email
  //is done by the Schema. Hashing password  for invalid names and emails  will waste a lot
  //of time and the document will not be save hence the logic.
  const newMember = new this({
    name,
    email,
    password,
  });
  await newMember.save();
  return await newMember.update("password", password);
};

statics.findByEmail = async function (email) {
  return await this.findOne({ email });
};

statics.findOneWithCredentials = async function (email, password) {
  const member = await this.findByEmail(email);
  if (!member) {
    return null;
  }
  const doMatch = await member.isCorrect(password);
  if (doMatch) return member;
  else return null;
};

methods.isCorrect = async function (password) {
  return await confirmPassword(password, this.password);
};

methods.markEmailAsConfirmed = async function () {
  this.isEmailConfirmed = true;
  return await this.save();
};

methods.update = async function (field, data) {
  if (field === "password") {
    const { minlength, maxlength, error } = ranges.password;
    throwErrorIfStringLengthNotInRange(data, minlength, maxlength, error);
    data = await hashPassword(data);
  }
  this.set(field, data);
  return await this.save();
};

methods.updateMany = async function (data) {
  for (const key in data) {
    await this.update(key, data[key]);
  }
};

methods.deleteAccount = async function () {
  await this.deleteOne();
};
module.exports = mongoose.model("Base", Base);
