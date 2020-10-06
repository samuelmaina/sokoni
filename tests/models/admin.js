const {Admin} = require("../../database/models/index");
const {connectToDb, closeConnectionToBd} = require("../config");

const baseTest = require("./baseAdminAndUser");
describe("---Admin", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
  baseTest(Admin);
});
