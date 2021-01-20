const mongoose = require("mongoose");

const ranges = require("../../config/constraints").base;

const {throwErrorIfStringLengthNotInRange} = require("./utils");
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
      minlength: ranges.name.minlength,
      maxlength: ranges.name.maxlength,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: ranges.email.minlength,
      maxlength: ranges.email.maxlength,
    },
    tel: {
      type: String,
      required: true,
      minlength: ranges.tel,
      maxlength: ranges.tel,
      default: "+254700000000",
    },
    password: {
      type: String,
      required: true,
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
  //the schema does not validate plain passwords
  // hence need for manual checking.
  const password = data.password;
  const {minlength, maxlength, error} = ranges.password;
  throwErrorIfStringLengthNotInRange(password, minlength, maxlength, error);

  const hashedPassword = await hashPassword(data.password);
  const newMember = new this({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
  return await newMember.save();
};

statics.findByEmail = async function (email) {
  return await this.findOne({email});
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

methods.update = async function (field, data) {
  if (field === "password") {
    const {minlength, maxlength, error} = ranges.password;
    throwErrorIfStringLengthNotInRange(data, minlength, maxlength, error);
    data = await hashPassword(data);
  }
  this.set(field, data);
  return await this.save();
};
methods.updateMany = async function (data) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      await this.update(key, data[key]);
    }
  }
};

methods.deleteAccount = async function () {
  await this.deleteOne();
};
module.exports = mongoose.model("Base", Base);
