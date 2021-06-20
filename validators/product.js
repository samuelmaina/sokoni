const ranges = require("../config/constraints").product;
const body = require("express-validator").check;

const title = body("title")
  .isString()
  .withMessage("Title must be a string.")
  .isLength({min: ranges.title.minlength, max: ranges.title.maxlength})
  .withMessage(ranges.title.error);

const buyingPrice = body("buyingPrice")
  .isNumeric()
  .withMessage("Buying price must be a number.")
  .custom(value => {
    const {min, max, error} = ranges.buyingPrice;
    if (!(value >= min && value <= max)) {
      throw new Error(error);
    }
    return true;
  });
const percentageProfit = body("percentageProfit")
  .isNumeric()
  .withMessage("Percentage profit must be a number.")
  .custom(value => {
    const {min, max, error} = ranges.percentageProfit;
    if (!(value >= min && value <= max)) {
      throw new Error(error);
    }
    return true;
  });
const quantity = body("quantity")
  .isNumeric()
  .withMessage("Quantity must be a number.")
  .isInt()
  .withMessage("Quantity must be a whole number.")
  .custom(value => {
    const {min, max, error} = ranges.quantity;
    if (!(value >= min && value <= max)) {
      throw new Error(error);
    }
    return true;
  });

const description = body("description")
  .isString()
  .withMessage("Description must be a string.")
  .isLength({
    min: ranges.description.minlength,
    max: ranges.description.maxlength,
  })
  .withMessage(ranges.description.error);

const brand = body("brand")
  .isString()
  .withMessage("Brand must be a string.")
  .isLength({
    min: ranges.brand.minlength,
    max: ranges.brand.maxlength,
  })
  .withMessage(ranges.brand.error);

const category = body("category")
  .isString()
  .withMessage("Category must be a string.")
  .isLength({
    min: ranges.category.minlength,
    max: ranges.category.maxlength,
  })
  .withMessage(ranges.category.error);

module.exports=[
  title,
  buyingPrice,
  percentageProfit,
  quantity,
  brand,
  category,
  description
]
