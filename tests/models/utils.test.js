const requires = require("../utils/requires");

const { throwErrorIfStringLengthNotInRange, ensureIsMongooseId } =
  requires.ModelUtils;
const { generateMongooseId } = require("../utils/generalUtils/utils");
const {
  verifyThrowsError,
  verifyDoesNotThrowError,
} = require("../utils/testsUtils");

describe("utils tests", () => {
  describe("throwErrorIfStringLengthNotInRange", () => {
    const error = "String length not in range";
    it("does not throw on valid strings", () => {
      const threeLetters = "lol";
      verifyDoesNotThrowError(() => {
        throwErrorIfStringLengthNotInRange(threeLetters, 1, 3, error);
      });

      verifyDoesNotThrowError(() => {
        throwErrorIfStringLengthNotInRange(threeLetters, 1, 3, error);
      });
    });
    it("throws for very short", () => {
      const tooSmall = "hi";
      verifyThrowsError(() => {
        throwErrorIfStringLengthNotInRange(tooSmall, 3, 4, error);
      });
    });
    it("throws for too large", () => {
      const long = "four";
      verifyThrowsError(() => {
        throwErrorIfStringLengthNotInRange(long, 2, 3, error);
      });
    });
    it("throws on non strings", () => {
      const num = 1;
      verifyThrowsError(() => {
        throwErrorIfStringLengthNotInRange(num, 2, 3, error);
      });
    });
  });
});
