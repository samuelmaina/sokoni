const requires= require("../../utils/requires");

const { shopServices } = requires.services;
const {
  verifyEqual,
  verifyNull,
  verifyUndefined,
} = require("../../utils/testsUtils");

const { generateMongooseId } = require("../../utils/generalUtils/utils");

const { productQuantityValidator, cartTotalValidator, addToAdminSales } =
  shopServices;
describe("Shop services", () => {
  describe("productQuantityValidator", () => {
    it("should not reject if the quantity is within range ", () => {
      const product = {
        quantity: 50,
        sellingPrice: 101.5,
      };
      const selectedQuantity = product.quantity;
      const error = productQuantityValidator(product, selectedQuantity);
      verifyUndefined(error);
    });
    it("should reject when the selected quantity is greater than the present quantity", () => {
      const product = {
        quantity: 50,
        sellingPrice: 101.5,
      };
      const selectedQuantity = product.quantity + 1;
      const error = productQuantityValidator(product, selectedQuantity);
      verifyEqual(
        error,
        `On stock quantity is ${product.quantity}.Please request less quantity`
      );
    });
  });
  describe("cartTotalValidator", () => {
    it("Should not reject when value is within balance", () => {
      const total = 1000;
      const productsTotal = 200;
      const balance = 1200;
      const error = cartTotalValidator(total, productsTotal, balance);
      verifyUndefined(error);
    });
    it("Should reject when the new total is less than the balance", () => {
      const total = 1000;
      const productsTotal = 200;
      const balance = 1199;
      const error = cartTotalValidator(total, productsTotal, balance);
      verifyEqual(
        error,
        `Dear customer you don't have enough balance to complete
         this transaction. Please reduce your quantity or  recharge Kshs ${(1).toFixed(
           2
         )} in your account and try again.`
      );
    });
  });
});
