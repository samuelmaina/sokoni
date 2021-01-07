const express = require("express");
const router = express.Router();
let {validators} = require("../../utils");
const {edit} = require("../../controllers");

const {
  nameValidator,
  emailValidator,
  passwordValidator,
  confirmPasswordValidator,
} = validators.auth;
const userEditController = edit.user;

const changeDetailsValidator = [nameValidator, emailValidator];
const newPasswordValidator = [passwordValidator, confirmPasswordValidator];
router
  .route("/change-details")
  .get(userEditController.getEditDetails)
  .post(changeDetailsValidator, userEditController.postEditDetails);
router
  .route("/change-password")
  .get(userEditController.getChangePassword)
  .post(newPasswordValidator, userEditController.postChangePassword);
module.exports = router;
