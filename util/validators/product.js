const body = require("express-validator").check;


const productInfoValidation=[
    body("title")
      .isLength({ min: 5,max:15 })
      .withMessage(
        "Please provide the product with a title which is between 5 and 15 characters long"
      ),
    body("price")
      .isNumeric()
      .withMessage("Price must be a number")
      .custom(value => {
        if (value < 0) {
          throw new Error("Price must be a positive real number");
        }
        return true;
      }),
    body("quantity")
      .isInt()
      .withMessage("Quantity must positive whole number")
      .custom(value => {
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
  ]

  module.exports={
      productInfoValidation
  }