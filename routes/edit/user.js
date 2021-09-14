const express = require("express");
const router = express.Router();
let { auth, accounting } = require("../../validators");
const { edit } = require("../../controllers");

const { newPasswordValidator, updateValidator } = auth;

const userEditController = edit.user;

router
  .route("/change-details")
  .get(userEditController.getEditDetails)
  .post(updateValidator, userEditController.postEditDetails);
router
  .route("/change-password")
  .get(userEditController.getChangePassword)
  .post(newPasswordValidator, userEditController.postChangePassword);
module.exports = router;
