const express = require("express");
const router = express.Router();
let {validators} = require("../../util");
const updateValidators = validators.auth;

const {edit} = require("../../controllers");
const userEditController = edit.user;

router.get("/change-details", userEditController.getEditDetails);
router.post(
  "/change-details",
  updateValidators.changeDetailsValidator,
  userEditController.postEditDetails
);
router.get("/change-password", userEditController.getChangePassword);
router.post(
  "/change-password",
  updateValidators.newPasswordValidator,
  userEditController.postChangePassword
);
module.exports = router;
