const express = require("express");
const router = express.Router();
let {auth, accounting} = require("../../validators");
const {edit} = require("../../controllers");

const {newPasswordValidator} = auth;
const {paymentValidator} = accounting;
const userEditController = edit.user;

router
  .route("/change-details")
  .get(userEditController.getEditDetails)
  .post(paymentValidator, userEditController.postEditDetails);
router
  .route("/change-password")
  .get(userEditController.getChangePassword)
  .post(newPasswordValidator, userEditController.postChangePassword);
module.exports = router;
