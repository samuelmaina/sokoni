const body = require("express-validator/").check;

const validateAmount = body("amount")
  .isNumeric()
  .withMessage("Deposit amount greater than 100")
  .custom((value) => {
    if (value < 100) {
      throw new Error("Deposit amount greater than 100");
    }
    return true;
  });
const validatePaymentMethod = body("paymentMethod")
  .isAlphanumeric()
  .withMessage("The Mode should be greater than 3")
  .isLength({ min: 3 });
exports.userPayment = [validatePaymentMethod, validateAmount];
