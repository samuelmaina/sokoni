const body = require("express-validator").check;

const productInfoValidation = [
  body("title")
    .isLength({ min: 5, max: 15 })
    .withMessage(
      "Please provide the product with a title which is between 5 and 15 characters long"
    )
    .trim(),
  body("buyingPrice")
    .isNumeric()
    .withMessage("buyingPrice must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("buyingPrice must be a positive real number");
      }
      return true;
    }),
  body("percentageProfit")
    .isNumeric()
    .withMessage("percentageProfit must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("percentageProfit must be a positive real number");
      }
      return true;
    }),
  body("expirationPeriod")
    .isNumeric()
    .withMessage("expirationPeriod must be a number")
    .custom((value) => {
      if (value < 0) {
        throw new Error("expirationPeriod must be a positive real number");
      }
      return true;
    }),
  body("quantity")
    .isInt()
    .withMessage("Quantity must be positive whole number")
    .custom((value) => {
      if (value < 1) {
        throw new Error(
          "quantity must be greater than zero and must be a whole number"
        );
      }
      return true;
    }),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Very short description.Please type atleast 10 words")
    .trim(),
  body("brand")
    .isLength({ min: 3, max: 20 })
    .withMessage("brand should be 3-20 characters long")
    .trim(),
  body("category")
    .isLength({ min: 3, max: 20 })
    .withMessage("category should be 3-20 characters long")
    .trim(),
];

module.exports = {
  productInfoValidation,
};
