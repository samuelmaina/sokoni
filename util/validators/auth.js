const { User, Admin } = require("../../database/interfaces/auth");

const body = require("express-validator/").check;

const nameValidator = body("name")
  .isLength({ min: 6, max: 20 })
  .withMessage("Invalid name.Name should be 6-20 characters long");

const emailValidator = body("email")
  .isEmail()
  .withMessage("Please enter a valid email");

const passwordValidator = body(
  "password",
  "The password should be 8 or more character and should be alphanumeric!"
)
  .isLength({ min: 8 })
  .not()
  .isAlphanumeric();

const confirmPasswordValidator = body("ConfirmPassword").custom(
  (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    }
    return true;
  }
);
const signUpEmailValidator = (Model) => {
  return body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value) => {
      return Model.findByEmail(value).then((document) => {
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
