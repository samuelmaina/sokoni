const {Admin} = require("../../database/models");
const {connectToDb, closeConnectionToBd} = require("../config");

const baseTest = require("./baseAdminAndUser");
describe.skip("---Admin", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
  baseTest(Admin);
});
