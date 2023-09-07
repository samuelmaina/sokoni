const requires = require("../utils/requires");

const { accounting } = requires.validators;

const ranges = requires.constrains.accounting;
const { validateAmount, validatePaymentMethod, paymentValidators } = accounting;

const { validateFloatField, validateStringField } = require("./utils");

describe("Accounting validators", () => {
  describe("Amount", () => {
    const { min, max, error } = ranges.amount,
      delta = 0.01;
    validateFloatField(validateAmount, "amount", min, max, error);
  });
  describe("Payment Method", () => {
    const { minlength, maxlength, error } = ranges.paymentMethod;
    validateStringField(
      validatePaymentMethod,
      "paymentMethod",
      minlength,
      maxlength,
      error
    );
  });
});
