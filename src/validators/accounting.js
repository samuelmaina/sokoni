const body = require("express-validator/").check;
const ranges = require("../config/constraints").accounting;

exports.validateAmount = body("amount")
  .isNumeric()
  .withMessage("Amount must be a number.")
  .custom((value) => {
    const { min, max, error } = ranges.amount;
    if (!(value >= min && value <= max)) {
      throw new Error(error);
    }
    return true;
  });
const { minlength, maxlength, error } = ranges.paymentMethod;
exports.validatePaymentMethod = body("paymentMethod")
  .isString()
  .withMessage("Payment method must be a string.")
  .isLength({ min: minlength, max: maxlength })
  .withMessage(error);

exports.paymentValidator = [this.validateAmount, this.validatePaymentMethod];
