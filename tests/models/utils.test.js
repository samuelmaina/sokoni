const utils = require("../../database/models/utils");

const {
  verifyIDsAreEqual,
  verifyEqual,
  verifyTruthy,
  verifyNull,
} = require("../utils/testsUtils");

const {
  generateMongooseId,
  clearDataFromModel,
} = require("../utils/generalUtils");

const TRIALS = 50;
describe.skip("Utils tests", () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToBd();
  });

  afterEach(async () => {
    await clearDataFromModel(TokenGenerator);
  });
  it("ensureIsMongooseId return true if the value is a mongoose id and false otherwise.", async () => {
    const validMongooseId = generateMongooseId();
    const isValid = utils.ensureIsMongooseId(validMongooseId);
    verifyTruthy(isValid);
  });
});
