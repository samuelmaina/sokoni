const express = require("express");
const router = express.Router();

const {account} = require("../../controllers");
const controller = account.user;

const accountValidator = require("../../util/validators/accounting");

router
  .route("/deposit")
  .get(controller.getDeposit)
  .post(accountValidator.userPayment, controller.postDeposit);

module.exports = router;
