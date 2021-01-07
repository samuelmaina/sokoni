const express = require("express");
const router = express.Router();

const {account} = require("../../controllers");
const controller = account.user;

const {validators} = require("../../utils");
const {accounting} = validators;
const {validateAmount, validatePaymentMethod} = accounting;
const paymentValidator = [validateAmount, validatePaymentMethod];

router
  .route("/deposit")
  .get(controller.getDeposit)
  .post(paymentValidator, controller.postDeposit);

module.exports = router;
