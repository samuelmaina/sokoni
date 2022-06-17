const express = require("express");
const router = express.Router();

const { account } = require("../../controllers");
const controller = account.user;

const { accounting } = require("../../validators");
const { paymentValidator } = accounting;

router
  .route("/deposit")
  .get(controller.getDeposit)
  .post(
    paymentValidator,
    controller.validateInput,
    controller.creditIntoAccount
  );

module.exports = router;
