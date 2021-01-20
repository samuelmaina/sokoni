const body = require("express-validator").check;

const ranges = require("../config/constraints").base;

const name = ranges.name;

exports.nameV = body("name")
  .isString()
  .withMessage("Name must be a string.")
  .isLength({
    min: name.minlength,
    max: name.maxlength,
  })
  .withMessage(name.error);

const email = ranges.email;
exports.emailV = body("email")
  .isString()
  .withMessage("Email must be a string.")
  .isLength({min: email.minlength, max: email.maxlength})
  .withMessage(email.error)
  .isEmail()
  .withMessage("Please enter a valid email.");

const containsANumber = /[0-9]/;
const containsAlowerCase = /[a-z]/;
const containsAnUppercase = /[A-Z]/;
const doesNotContainsSpecialCharacter = /[a-zA-Z0-9]+$/;

const password = ranges.password;
exports.passwordV = body(
  "password",
  "The password should be 8 or more character and must contain symbols"
)
  .isString()
  .withMessage("Password must be a string.")
  .isLength({min: password.minlength, max: password.maxlength})
  .withMessage(password.error)
  .matches(containsANumber)
  .withMessage("Password must contain a number.")
  .matches(containsAlowerCase)
  .withMessage("Password must contain a lowercase character.")
  .matches(containsAnUppercase)
  .withMessage("Password must contain an uppercase character.")
  //using double negation to get p,
  //i.e not not p is logically equivalent to p
  //where p is the proposition that
  //'it contains special marks'
  .not()
  .matches(doesNotContainsSpecialCharacter)
  .withMessage("Password must contain a special character.");

exports.confirmPasswordV = body("confirmPassword").custom((value, {req}) => {
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

exports.loginValidator = [this.emailV, this.passwordV];
exports.resetValidator = [this.emailV];
exports.newPasswordValidator = [this.passwordV, this.confirmPasswordV];
