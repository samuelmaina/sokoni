const requires= require("../../utils/requires");

const { productServices } = requires.services;
const {
  verifyEqual,
  verifyFalsy,
  verifyTruthy,
} = require("../../utils/testsUtils");

const { PRODUCTS_PER_PAGE } = requires.envs;
const { calculateSellingPrice, calculatePaginationData } = productServices;

describe("Product services", () => {
  it("should calculate selling Price", () => {
    const product = {
      buyingPrice: 100.0,
      percentageProfit: 30,
    };
    calculateSellingPrice(product);
    verifyEqual(product.sellingPrice, Number((130.0).toFixed(2)));
  });
  describe("should calculate pagination data", () => {
    it(" should show the current page", () => {
      const page = 1,
        total = 1000;
      const { currentPage } = calculatePaginationData(page, total);
      verifyEqual(page, currentPage);
    });
    describe("should show has previous page", () => {
      it("for valid page", () => {
        const page = 1,
          noOfProducts = 100;
        const { hasNextPage } = calculatePaginationData(page, noOfProducts);
        verifyTruthy(hasNextPage);
      });

      it("when in the last page", () => {
        const page = 1,
          total = PRODUCTS_PER_PAGE;
        const { hasNextPage } = calculatePaginationData(page, total);
        verifyFalsy(hasNextPage);
      });
    });

    describe("should show has next page", () => {
      it("when page is 1", () => {
        const page = 1,
          total = 1000;

        const { hasPreviousPage } = calculatePaginationData(page, total);
        verifyFalsy(hasPreviousPage);
      });
      it("page greater than 1", () => {
        const page = 2,
          total = 1000;

        const { hasPreviousPage } = calculatePaginationData(page, total);
        verifyTruthy(hasPreviousPage);
      });
    });
    it("should calculate the next page", () => {
      const currentPage = 3;
      const noOfProducts = 100;
      const { nextPage } = calculatePaginationData(currentPage, noOfProducts);
      verifyEqual(nextPage, 4);
    });
    it("should calculate the previous page", () => {
      const currentPage = 4;
      const noOfProducts = 100;
      const { previousPage } = calculatePaginationData(
        currentPage,
        noOfProducts
      );
      verifyEqual(previousPage, 3);
    });

    describe("should calculate the last page", () => {
      it("when the number of products  is a divisor of PRODUCT PER PAGE", () => {
        const currentPage = 2;
        const noOfProducts = PRODUCTS_PER_PAGE * 10;
        const { lastPage } = calculatePaginationData(currentPage, noOfProducts);
        verifyEqual(lastPage, 10);
      });
      it("when the number of products  is not a divisor of PRODUCT PER PAGE", () => {
        const currentPage = 2;
        const noOfProducts = PRODUCTS_PER_PAGE * 10.5;
        const { lastPage } = calculatePaginationData(currentPage, noOfProducts);
        verifyEqual(lastPage, 11);
      });
    });
  });
});
