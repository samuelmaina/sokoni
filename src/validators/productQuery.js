const ranges = require("../config/constraints");

const { intValidator, stringValidator } = require("./utils");

const { page } = ranges.shop;
const { category } = ranges.product;

exports.pageV = intValidator({
  field: "page",
  min: page.min,
  max: page.max,
  err: page.error,
});

exports.categoryV = stringValidator({
  field: "category",
  min: category.minlength,
  max: category.maxlength,
  err: category.error,
});
exports.productQueryValidator = [this.pageV, this.categoryV];
