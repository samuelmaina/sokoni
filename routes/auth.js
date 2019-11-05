const express = require("express");
const { body } = require("express-validator/check");

const router = express.Router();

const AuthControllers = require("../controllers/auth");
const User = require("../models/user");

router.get("/login", AuthControllers.getLogin);

router.post("/login", AuthControllers.postLogin);

router.post("/logout", AuthControllers.postLogout);

router.get("/signup", AuthControllers.getSignUp);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(value => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject(
              "The email already exists please try another on"//check for the existence of an email before feeding the data to the database
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
  ],
  AuthControllers.postSignUp
);

module.exports = router;
