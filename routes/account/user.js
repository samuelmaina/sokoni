const express = require("express");
const router = express.Router();

const {account} = require("../../controllers");
const controller = account.user;

const {validators} = require("../../utils");
const {accounting} = validators;

router
  .route("/deposit")
  .get(controller.getDeposit)
  .post(accounting.userPayment, controller.postDeposit);

module.exports = router;
