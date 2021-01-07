//test suite uses
//boundary analysis.

const {equal} = require("assert");
const {
  ensureGeneratesErrorOnBody,
  ensureDoesNotGenerateErrorOnBody,
} = require("./utils");

const {validators, validationResults} = require("../../../utils");
const {accounting} = validators;
const {validateAmount, validatePaymentMethod} = accounting;

describe.skip("Accounting validators rejects invalid accounting details", () => {
  describe("Amount", () => {
    const lowerLimit = 100,
      upperLimit = 200000,
      delta = 0.01;

    it(" Non-Numerics", async () => {
      const errorMessage = "Amount must be numeric.";
      const amount = {name: 4};
      const body = {
        amount,
      };
      await ensureGeneratesErrorOnBody(body, validateAmount, errorMessage);
    });
    describe(`values less than ${lowerLimit} and higher than ${upperLimit} `, () => {
      const errorMessage = `Amount must range from ${lowerLimit} to 200,000`;
      it(`< ${lowerLimit}`, async () => {
        await ensureGeneratesErrorOnBody(
          {
            amount: lowerLimit - delta,
          },
          validateAmount,
          errorMessage
        );
      });
      it(`> 200,000`, async () => {
        await ensureGeneratesErrorOnBody(
          {
            amount: upperLimit + delta,
          },
          validateAmount,
          errorMessage
        );
      });
    });
    it("does not throw for valid boundary amounts", async () => {
      const validAmounts = [
        lowerLimit,
        upperLimit,
        lowerLimit + delta,
        upperLimit - delta,
      ];
      for (const amount of validAmounts) {
        await ensureDoesNotGenerateErrorOnBody({amount}, validateAmount);
      }
    });
  });
  describe("Payment Method", () => {
    const lowerLimitLength = 3,
      upperLimitLength = 12;
    //No need to add delta since
    //only a single character can be
    //added  or removed from a string.

    it("non string", async () => {
      const errorMessage = "Payment method must be a string.";
      const paymentMethod = 123;
      await ensureGeneratesErrorOnBody(
        {
          paymentMethod,
        },
        validatePaymentMethod,
        errorMessage
      );
    });
    describe(`strings shorter than ${lowerLimitLength} and greater than ${upperLimitLength}`, () => {
      const errorMessage = `Payment method should be ${lowerLimitLength}-${upperLimitLength} characters long.`;

      it(`<${lowerLimitLength}`, async () => {
        const shortString = "PA";
        //verify that string is shorter.
        equal(shortString.length, lowerLimitLength - 1);
        await ensureGeneratesErrorOnBody(
          {
            paymentMethod: shortString,
          },
          validatePaymentMethod,
          errorMessage
        );
      });
      it(`>${upperLimitLength}`, async () => {
        const paymentMethod = "abcde fghijkl";
        equal(paymentMethod.length, upperLimitLength + 1);
        await ensureGeneratesErrorOnBody(
          {
            paymentMethod,
          },
          validatePaymentMethod,
          errorMessage
        );
      });
    });
    it("does not reject valid boundary values", async () => {
      const lowerlimit = "abc";
      equal(lowerlimit.length, lowerLimitLength);
      const upperLimit = "abcde fghijk";
      equal(upperLimit.length, upperLimitLength);
      const greaterThanLLBy1 = "abcd";
      equal(greaterThanLLBy1.length, lowerLimitLength + 1);
      const lessThanULBy1 = "abcde fghij";
      equal(lessThanULBy1.length, upperLimitLength - 1);
      const valids = [lowerlimit, upperLimit, greaterThanLLBy1, lessThanULBy1];
      for (const paymentMethod of valids) {
        await ensureDoesNotGenerateErrorOnBody(
          {
            paymentMethod,
          },
          validatePaymentMethod
        );
      }
    });
  });
});
