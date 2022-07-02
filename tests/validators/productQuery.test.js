const requires = require("../utils/requires");

const { shop, product } = requires.constrains;

const { page } = shop;
const { category } = product;

const { verifyEqual, ensureArrayContains } = require("../utils/testsUtils");

const { generateStringSizeN } = require("../utils/generalUtils/utils");

const { productQueryValidator, pageV, categoryV } =
  requires.validators.productQuery;
const { ensureGeneratesErrorOnPart } = require("./utils");

describe("productQuery validators", () => {
  describe("pageV", () => {
    const { min, max, error } = page;

    runTest(
      "should refuse when smaller than the required range  ",
      min - 1,
      error
    );
    runTest(
      "should refuse when greater than the required range ",
      max + 1,
      error
    );

    function runTest(testMessage, testValue, err) {
      it(testMessage, async () => {
        const params = {
          page: testValue,
        };
        await ensureGeneratesErrorOnPart(params, pageV, err);
      });
    }
  });

  describe("categoryV", () => {
    const { minlength, maxlength, error } = category;
    runTest(
      "should refuse when smaller than the required range  ",
      generateStringSizeN(minlength - 1),
      error
    );
    runTest(
      "should refuse when greater than the required range ",
      generateStringSizeN(maxlength + 1),
      error
    );

    function runTest(testMessage, testValue, err) {
      it(testMessage, async () => {
        const params = {
          category: testValue,
        };
        await ensureGeneratesErrorOnPart(params, categoryV, err);
      });
    }
  });
  it("ensure productQueryValidator has only the page and category validator", () => {
    verifyEqual(productQueryValidator.length, 2);
    const expected = [pageV, categoryV];
    for (const validator of expected) {
      ensureArrayContains(expected, validator);
    }
  });
});
