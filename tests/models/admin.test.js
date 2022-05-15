const requires = require("../utils/requires");

const { Admin } = requires.Models;
const { includeSetUpAndTearDown } = require("./utils");

const baseTest = require("./baseAuth");
describe.skip("---Admin", () => {
  includeSetUpAndTearDown();
  baseTest(Admin);
});
