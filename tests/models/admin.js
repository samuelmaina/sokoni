const {Admin} = require("../../database/models/index");
const {connectToDb} = require("../config");

const baseTest = require("./baseAdminAndUser");
describe("---Admin", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  baseTest(Admin);
});
