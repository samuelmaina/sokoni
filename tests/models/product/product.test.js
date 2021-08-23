const { includeSetUpAndTearDown } = require("../utils");
const statics = require("./statics");
const methods = require("./methods");

describe.skip("--Product", () => {
  includeSetUpAndTearDown();
  describe("Statics", statics);
  describe("Methods", methods);
});
