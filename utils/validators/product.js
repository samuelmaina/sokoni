const body = require("express-validator").check;

exports.titleValidator = body("title")
  .isString()
  .withMessage("Title must be a string.")
  .isLength({min: 5, max: 20})
  .withMessage("Title should be 5-20 characters long.");

exports.buyingPriceValidator = body("buyingPrice")
  .isNumeric()
  .withMessage("Buying price must be a number")
  .custom(value => {
    if (!(value >= 100 && value <= 200000)) {
      throw new Error("Buying price must range from 100 to 200000");
    }
    return true;
  });
exports.percentageProfitValidator = body("percentageProfit")
  .isNumeric()
  .withMessage("Percentage profit must be a number.")
  .custom(value => {
    if (!(value >= 0 && value <= 300)) {
      throw new Error("Percentage profit must range from 0 to 300.");
    }
    return true;
  });
exports.expirationPeriodValidator = body("expirationPeriod")
  .isNumeric()
  .withMessage("expirationPeriod must be a number")
  .custom(value => {
    if (value < 0) {
      throw new Error("expirationPeriod must be a positive real number");
    }
    return true;
  });
exports.quntityValidator = body("quantity")
  .isInt()
  .withMessage("Quantity must be positive whole number")
  .custom(value => {
    if (value < 1) {
      throw new Error(
        "quantity must be greater than zero and must be a whole number"
      );
    }
    return true;
  });

exports.descriptionValidator = body("description")
  .isLength({min: 10})
  .withMessage("Very short description.Please type atleast 10 words")
  .trim();
exports.brandValidator = body("brand")
  .isLength({min: 3, max: 20})
  .withMessage("brand should be 3-20 characters long")
  .trim();

exports.categoryValidator = body("category")
  .isLength({min: 3, max: 20})
  .withMessage("category should be 3-20 characters long")
  .trim();
