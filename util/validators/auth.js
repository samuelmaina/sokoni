const body= require("express-validator/").check;
const {Admin,User} = require("../../database/interfaces/auth");

  const adminSignUpValidator= [
  body('name').isLength({min:6,max:20}).withMessage('Invalid name.Name should be 6-20 characters long'),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom(value => {
      return Admin.findByEmail(value).then(admin => {
        if (admin) {
          return Promise.reject(
            "The Admin email already exists.Please try another one"
          );
        }
      });
    }),

  body(
    "password",
    "The password should be 8 or more character and should be alphanumeric!"
  ).isLength({ min: 8 }),
  body("ConfirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    }
    return true;
  })
];

const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email"),
  body(
    "password",
    "The password should be 8 or more character and should be alphanumeric!"
  ).isLength({ min: 8 })
];

 const validateReset=body("email")
   .isEmail()
   .withMessage("Please enter a valid email");
  
   const newPasswordValidator=[body(
    "password",
    "The password should be 8 or more character and should be alphanumeric!"
  ).isLength({ min: 8 }),
  body("ConfirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    }
    return true;
  })]


  const userSignUpValidator = [
    body('name').isLength({min:6,max:20}).withMessage('Invalid name.Name should be 6-20 characters long.'),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(value => {
        return User.findByEmail(value).then(user => {
          if (user) {
            return Promise.reject(
              "The email already exists,try another one" 
            );
          }
        });
      }),

    body(
      "password",
      "The password should be 8 or more character and should be alphanumeric!"
    ).isLength({ min: 8 }),
    body("ConfirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match!");
      }
      return true;
    })
  ];



module.exports={
    adminSignUpValidator,
    loginValidator,
    validateReset,
    newPasswordValidator, 
    userSignUpValidator
}