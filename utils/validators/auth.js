const body = require("express-validator/").check;
const {BaseServices} = require("../../database/services");
const {ranges, errorMessages} = BaseServices;

exports.nameValidator = body("name")
  .isString()
  .withMessage("Name must be a string.")
  .isLength({
    min: ranges.name[0],
    max: ranges.name[1],
  })
  .withMessage(errorMessages.name);

exports.emailValidator = body("email")
  .isString()
  .withMessage("Email must be a string.")
  .isEmail()
  .withMessage("Please enter a valid email.")
  .isLength({min: ranges.email[0], max: ranges.email[1]})
  .withMessage(errorMessages.email);

const containsANumber = /[0-9]/;
const containsAlowerCase = /[a-z]/;
const containsAnUppercase = /[A-Z]/;
const doesNotContainsSpecialCharacter = /[a-zA-Z0-9]+$/;

exports.passwordValidator = body(
  "password",
  "The password should be 8 or more character and must contain symbols"
)
  .isString()
  .withMessage("Password must be a string.")
  .isLength({min: ranges.password[0], max: ranges.password[1]})
  .withMessage(errorMessages.password)
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

exports.confirmPasswordValidator = body("confirmPassword").custom(
  (value, {req}) => {
    if (value !== req.body.password) {
      throw new Error("Password and confirm password do not match!");
    }
    return true;
  }
);
