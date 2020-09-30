const { Admin } = require("../../database/models/index");

const baseTest = require("./baseAdminAndUser");
describe("---Admin", () => {
  baseTest(Admin);
});
