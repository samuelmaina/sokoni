const express = require("express");
const router = express.Router();
let {validators} = require("../../utils");
const authValidators = validators.auth;

const {edit} = require("../../controllers");
const userEditController = edit.user;

router.get("/change-details", userEditController.getEditDetails);
router.post(
  "/change-details",
  authValidators.changeDetailsValidator,
  userEditController.postEditDetails
);
router.get("/change-password", userEditController.getChangePassword);
router.post(
  "/change-password",
  authValidators.newPasswordValidator,
  userEditController.postChangePassword
);
module.exports = router;
