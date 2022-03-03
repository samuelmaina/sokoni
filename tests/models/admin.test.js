const { Admin } = require("../../database/models");
const { includeSetUpAndTearDown } = require("./utils");

const baseTest = require("./baseAdminAndUser");
describe.skip("---Admin", () => {
  includeSetUpAndTearDown();
  baseTest(Admin);
});
