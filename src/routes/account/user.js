const express = require("express");
const router = express.Router();

const { account } = require("../../controllers");
const controller = account.user;

const { accounting } = require("../../utils/validators");
const { paymentValidator } = accounting;

router.route("/deposit").get(controller.getDeposit).post(paymentValidator);

module.exports = router;
