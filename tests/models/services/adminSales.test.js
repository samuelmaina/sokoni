const requires= require("../../utils/requires");




const { addSale } = requires.services.adminSalesServices;

const { generateMongooseId } = require("../../utils/generalUtils/utils");
const {
  ensureArrayConstainsKeyValuePair,
  verifyEqual,
  verifyIDsAreEqual,
  ensureValueGreateThan,
  ensureValueLessThan,
} = require("../../utils/testsUtils");

describe("Admin Sales Services", () => {
  describe("addSale", () => {
    it("should add product to the arr, together with the product sales Details.  ", () => {
      const arr = [];
      const sale = {
        productId: generateMongooseId(),
        quantity: 10,
      };
      addSale(arr, sale);
      verifyEqual(arr.length, 1);
      const first = arr[0];
      const { productId, quantity } = sale;
      verifyIDsAreEqual(first.productData, productId);
      const firstSales = first.sales;
      verifyEqual(firstSales.length, 1);
      verifyEqual(firstSales[0].quantity, quantity);
      //ensusre soldAt is add to  the sale
      ensureValueLessThan(firstSales[0].soldAt, Date.now());
    });
    it("should just add a sale if the product already exists  ", () => {
      const arr = [];
      const commonProductId = generateMongooseId();
      const sale1 = {
        productId: commonProductId,
        quantity: 10,
      };
      const sale2 = {
        productId: commonProductId,
        quantity: 5,
      };
      addSale(arr, sale1);
      addSale(arr, sale2);
      verifyEqual(arr.length, 1);
      const first = arr[0];
      verifyIDsAreEqual(first.productData, commonProductId);
      const firstSales = first.sales;
      verifyEqual(firstSales.length, 2);
      const firstSale = firstSales[0];
      const secondSale = firstSales[1];
      verifyEqual(firstSale.quantity, sale1.quantity);
      //ensusre soldAt is add to  the sale
      ensureValueLessThan(firstSale.soldAt, Date.now());
      verifyEqual(secondSale.quantity, sale2.quantity);
      //all the secondSale value gets soldAt value
      ensureValueLessThan(secondSale.soldAt, Date.now());
    });
    it("should add sales for a different product Id", () => {
      const arr = [];
      const sale1 = {
        productId: generateMongooseId(),
        quantity: 10,
      };
      const sale2 = {
        productId: generateMongooseId(),
        quantity: 10,
      };
      addSale(arr, sale1);
      addSale(arr, sale2);
      verifyEqual(arr.length, 2);
      const first = arr[0];
      const second = arr[1];
      verifyIDsAreEqual(first.productData, sale1.productId);
      verifyIDsAreEqual(second.productData, sale2.productId);
      const firstSales = first.sales;
      verifyEqual(firstSales.length, 1);
      const firstSale = firstSales[0];
      verifyEqual(firstSale.quantity, sale1.quantity);
      //ensusre soldAt is add to  the sale
      ensureValueLessThan(firstSale.soldAt, Date.now());
      const secondSale = second.sales;
      verifyEqual(secondSale.length, 1);
      verifyEqual(secondSale[0].quantity, sale2.quantity);
      //ensusre soldAt is add to  the sale
      ensureValueLessThan(secondSale[0].soldAt, Date.now());
    });
  });
});
