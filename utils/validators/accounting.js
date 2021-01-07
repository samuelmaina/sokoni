const body = require("express-validator/").check;

const validateAmount = body("amount")
  .isFloat()
  .withMessage("Amount must be numeric.")
  .custom(value => {
    if (!(value >= 100 && value <= 200000)) {
      throw new Error("Amount must range from 100 to 200,000");
    }
    return true;
  });

const validatePaymentMethod = body("paymentMethod")
  .isString()
  .withMessage("Payment method must be a string.")
  .isLength({min: 3, max: 12})
  .withMessage("Payment method should be 3-12 characters long.");
module.exports = {
  validateAmount,
  validatePaymentMethod,
};
