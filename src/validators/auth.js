const body = require("express-validator").check;
const { stringValidator, emailValidator } = require("./utils");

const ranges = require("../config/constraints").base;

const name = ranges.name;

exports.nameV = stringValidator({
  field: "name",
  min: name.minlength,
  max: name.maxlength,
  err: name.error,
});

const email = ranges.email;

exports.emailV = stringValidator({
  field: "email",
  min: email.minlength,
  max: email.maxlength,
  err: email.error,
})
  .isEmail()
  .withMessage("Please enter a valid email.");

const complexPasswordError =
  "Password must contain an uppercase, lowercase, a number and a special character";
const containsANumber = /[0-9]/;
const containsAlowerCase = /[a-z]/;
const containsAnUppercase = /[A-Z]/;
const doesNotContainsSpecialCharacter = /[a-zA-Z0-9]+$/;

const password = ranges.password;

const complexPassword =
  /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}$/;

exports.passwordV = stringValidator({
  field: "password",
  min: password.minlength,
  max: password.maxlength,
  err: password.error,
})
  .matches(complexPassword)
  .withMessage(complexPasswordError);

// the good thing that ws there to thosw who were there to do the last thing. I was teh

const telFormat = /^(?:254|\+254|0)?(7[0-9]{8})$/;

const telConstrain = ranges.tel;

exports.telV = stringValidator({
  field: "tel",
  min: telConstrain.minlength,
  max: telConstrain.maxlength,
  err: telConstrain.error,
})
  .matches(telFormat)
  .withMessage("Invalid Tel number");
//   .matches(containsAlowerCase)
//   .withMessage(complexPasswordError)
//   .matches(containsAnUppercase)
//   .withMessage(complexPasswordError)
//   //using double negation to get p,
//   //i.e not not p is logically equivalent to p
//   //where p is the proposition that
//   //'it contains special marks'
//   .not()
//   .matches(doesNotContainsSpecialCharacter)
//   .withMessage(complexPasswordError);

exports.confirmPasswordV = body("confirmPassword").custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error("Password and confirm password do not match!");
  }
  return true;
});
exports.signUpValidator = [
  this.nameV,
  this.emailV,
  this.passwordV,
  this.confirmPasswordV,
];

exports.updateValidator = [this.nameV, this.emailV, this.telV];

exports.loginValidator = [this.emailV, this.passwordV];
exports.resetValidator = [this.emailV];
exports.newPasswordValidator = [this.passwordV, this.confirmPasswordV];
