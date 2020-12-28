const body = require("express-validator/").check;
const User = require("../../database/models/user");
const Admin = require("../../database/models/admin");
const nameValidator = body(
  "name",
  "Name too short or it contains symbols.Enter only alphanumerics."
)
  .isLength({min: 6, max: 20})
  .isString();

const emailValidator = body("email")
  .isEmail()
  .withMessage("Please enter a valid email.");

const passwordValidator = body(
  "password",
  "The password should be 8 or more character and must contain symbols"
)
  .isLength({min: 8})
  .not()
  .isAlphanumeric();

const confirmPasswordValidator = body("confirmPassword").custom(
  (value, {req}) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    }
    return true;
  }
);
const signUpEmailValidator = Model => {
  return body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom(value => {
      return Model.findByEmail(value).then(document => {
        if (document) {
          return Promise.reject(
            `The email already exists.Please try another one`
          );
        }
      });
    });
};

const loginValidator = [emailValidator, passwordValidator];

const validateReset = [emailValidator];

const newPasswordValidator = [passwordValidator, confirmPasswordValidator];

const userSignUpValidator = [
  nameValidator,
  signUpEmailValidator(User),
  passwordValidator,
  confirmPasswordValidator,
];
const adminSignUpValidator = [
  nameValidator,
  signUpEmailValidator(Admin),
  passwordValidator,
  confirmPasswordValidator,
];

const changeDetailsValidator = [emailValidator, nameValidator];

module.exports = {
  userSignUpValidator,
  adminSignUpValidator,
  loginValidator,
  validateReset,
  newPasswordValidator,
  changeDetailsValidator,
};
