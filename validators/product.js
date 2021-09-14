const ranges = require("../config/constraints").product;
const { stringValidator, floatValidator, intValidator } = require("./utils");

const {
  title,
  buyingPrice,
  percentageProfit,
  quantity,
  description,
  brand,
  category,
} = ranges;

exports.title = stringValidator({
  field: "title",
  min: title.minlength,
  max: title.maxlength,
  err: title.error,
});
exports.buyingPrice = floatValidator({
  field: "buyingPrice",
  min: buyingPrice.min,
  max: buyingPrice.max,
  err: buyingPrice.error,
});

exports.percentageProfit = floatValidator({
  field: "percentageProfit",
  min: percentageProfit.min,
  max: percentageProfit.max,
  err: percentageProfit.error,
});

exports.quantity = intValidator({
  field: "quantity",
  min: quantity.min,
  max: quantity.max,
  err: quantity.error,
});

exports.description = stringValidator({
  field: "description",
  min: description.minlength,
  max: description.maxlength,
  err: description.error,
});

exports.brand = stringValidator({
  field: "brand",
  min: brand.minlength,
  max: brand.maxlength,
  err: brand.error,
});
exports.category = stringValidator({
  field: "category",
  min: category.minlength,
  max: category.maxlength,
  err: category.error,
});
exports.productValidator = [
  this.title,
  this.buyingPrice,
  this.percentageProfit,
  this.quantity,
  this.brand,
  this.category,
  this.description,
];
