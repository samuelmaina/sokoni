const requires = require("../utils/requires");

const ranges = requires.constrains.product;
const {
  validateStringField,
  validateFloatField,
  validateIntegerField,
  ensureGeneratesErrorOnPart,
} = require("./utils");

const { product } = requires.constrains;

const {
  title,
  buyingPrice,
  percentageProfit,
  quantity,
  description,
  brand,
  category,
  productValidator,
} = product;

describe("Product validator", () => {
  describe("Title", () => {
    const { minlength, maxlength, error } = ranges.title;
    validateStringField(title, "title", minlength, maxlength, error);
  });
  describe("Buying price", () => {
    const { min, max, error } = ranges.buyingPrice;
    validateFloatField(buyingPrice, "buyingPrice", min, max, error);
  });
  describe("Percentage Profit", () => {
    const { min, max, error } = ranges.percentageProfit;
    validateFloatField(percentageProfit, "percentageProfit", min, max, error);
  });
  describe("Quantity", () => {
    const { min, max, error } = ranges.quantity;
    validateIntegerField(quantity, "quantity", min, max, error);
  });

  describe("Description", () => {
    const { minlength, maxlength, error } = ranges.description;
    validateStringField(
      description,
      "description",
      minlength,
      maxlength,
      error
    );
  });
  describe("Brand", () => {
    const { minlength, maxlength, error } = ranges.brand;
    validateStringField(brand, "brand", minlength, maxlength, error);
  });
  describe("Category", () => {
    const { minlength, maxlength, error } = ranges.category;
    validateStringField(category, "category", minlength, maxlength, error);
  });

  it("ensure productvalidator has all the field validators.", () => {
    const validators = [
      title,
      buyingPrice,
      percentageProfit,
      quantity,
      description,
      brand,
      category,
    ];
    for (const validator of validators) {
      expect(productValidator).toContain(validator);
    }
  });
});
