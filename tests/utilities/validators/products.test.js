const {equal} = require("assert");

const {
  ensureGeneratesErrorOnBody,
  ensureDoesNotGenerateErrorOnBody,
} = require("./utils");
const {validators} = require("../../../utils/");

const {product} = validators;
const {
  titleValidator,
  buyingPriceValidator,
  percentageProfitValidator,
  expirationPeriodValidator,
  quntityValidator,
  descriptionValidator,
  brandValidator,
  categoryValidator,
} = product;

//test suites uses  boundary analysis
//to derive the test data.
describe.skip("Product validator throw on inappropriate", () => {
  describe("Title", () => {
    const LLimitLength = 5;
    const ULimitLength = 20;
    it("non-string ", async () => {
      const nonString = 1234;
      const errorMessage = "Title must be a string.";
      const body = {
        title: nonString,
      };
      await ensureGeneratesErrorOnBody(body, titleValidator, errorMessage);
    });
    describe(`strings < ${LLimitLength} and >${ULimitLength} long`, () => {
      const errorMessage = `Title should be ${LLimitLength}-${ULimitLength} characters long.`;
      it(`< ${LLimitLength}`, async () => {
        const short = "test";
        //ensure that the string
        //is of lower invalid boundary
        //length.
        equal(short.length, LLimitLength - 1);
        const body = {
          title: short,
        };
        await ensureGeneratesErrorOnBody(body, titleValidator, errorMessage);
      });
      it(`>${ULimitLength}`, async () => {
        const long = "Title that is too lo.";
        equal(long.length, ULimitLength + 1);
        const body = {
          title: long,
        };
        await ensureGeneratesErrorOnBody(body, titleValidator, errorMessage);
      });
    });
    it("does not generated errors on valid data", async () => {
      const ll = "title";
      equal(ll.length, LLimitLength);

      const llPlus1 = "title.";
      equal(llPlus1.length, LLimitLength + 1);

      const ul = "Title that is too lo";
      equal(ul.length, ULimitLength);

      const ulMinus1 = "Title that is too l";
      equal(ulMinus1.length, ULimitLength - 1);

      const valids = [ll, llPlus1, ul, ulMinus1];

      let body;
      for (const title of valids) {
        body = {
          title,
        };
        await ensureDoesNotGenerateErrorOnBody(body, titleValidator);
      }
    });
  });
  describe("Buying price", () => {
    const lL = 100.0;
    const uL = 200000.0;
    const delta = 0.01;
    it("non numeric", async () => {
      const errorMessage = "Buying price must be a number";
      const bP = "text";
      const body = {
        buyingPrice: bP,
      };
      await ensureGeneratesErrorOnBody(
        body,
        buyingPriceValidator,
        errorMessage
      );
    });
    describe(`<${lL} and >${uL}`, () => {
      const errorMessage = `Buying price must range from ${lL} to ${uL}`;
      it(`<${lL}`, async () => {
        const less = lL - delta;
        const body = {
          buyingPrice: less,
        };
        await ensureGeneratesErrorOnBody(
          body,
          buyingPriceValidator,
          errorMessage
        );
      });
      it(`>${uL}`, async () => {
        const greater = uL + delta;
        const body = {
          buyingPrice: greater,
        };
        await ensureGeneratesErrorOnBody(
          body,
          buyingPriceValidator,
          errorMessage
        );
      });
    });
    it("does not generated error on valid bp", async () => {
      const valids = [lL, lL + delta, uL, uL - delta];
      for (const buyingPrice of valids) {
        const body = {
          buyingPrice,
        };
        await ensureDoesNotGenerateErrorOnBody(body, buyingPriceValidator);
      }
    });
  });
  describe("Percentage Profit", () => {
    const lL = 0;
    const uL = 300;
    const delta = 0.01;
    it("non numeric", async () => {
      const errorMessage = "Percentage profit must be a number.";
      const pP = "text";
      const body = {
        percentageProfit: pP,
      };
      await ensureGeneratesErrorOnBody(
        body,
        percentageProfitValidator,
        errorMessage
      );
    });
    describe(`<${lL} and >${uL}`, () => {
      const errorMessage = `Percentage profit must range from ${lL} to ${uL}.`;
      it(`<${lL}`, async () => {
        const less = lL - delta;
        const body = {
          percentageProfit: less,
        };
        await ensureGeneratesErrorOnBody(
          body,
          percentageProfitValidator,
          errorMessage
        );
      });
      it(`>${uL}`, async () => {
        const greater = uL + delta;
        const body = {
          percentageProfit: greater,
        };
        await ensureGeneratesErrorOnBody(
          body,
          percentageProfitValidator,
          errorMessage
        );
      });
    });
    it("does not generated error on valid bp", async () => {
      const valids = [lL, lL + delta, uL, uL - delta];
      for (const percentageProfit of valids) {
        const body = {
          percentageProfit,
        };
        await ensureDoesNotGenerateErrorOnBody(body, percentageProfitValidator);
      }
    });
  });
});
