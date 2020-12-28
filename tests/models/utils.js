const {connectToDb, closeConnectionToBd} = require("../config");
exports.includeSetUpAndTearDown = () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });
};
